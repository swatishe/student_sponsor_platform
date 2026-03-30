"""
apps/messaging/consumers.py
────────────────────────────
Async WebSocket consumer for real-time chat.
Each conversation gets its own channel group: chat_<conversation_id>

Connection URL: ws://host/ws/chat/<conv_id>/?token=<JWT>
Send payload:   { "message": "Hello!" }
Receive payload:{ "type": "message", "content": "Hello!", "sender_id": 1, ... }
@author: sshende
"""

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .models import Conversation, Message

logger = get_user_model()
User   = get_user_model()

"""ChatConsumer handles WebSocket connections for real-time messaging. It authenticates users via JWT, verifies conversation participation, and manages message broadcasting to all participants in the conversation."""
class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        """
        Called on WebSocket CONNECT.
        Authenticates via ?token= query param, verifies participation,
        then joins the channel group for this conversation.
        """
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'

        # ── JWT Authentication from query string ──────────────
        self.user = await self.get_user_from_token()
        if not self.user:
            await self.close(code=4001)  # 4001 = Unauthorized
            return

        # ── Verify the user is a participant ──────────────────
        if not await self.check_participation():
            await self.close(code=4003)  # 4003 = Forbidden
            return

        # ── Join channel group and accept connection ───────────
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """
        Called when client sends a message.
        Persists it and broadcasts to the group.
        """
        try:
            data    = json.loads(text_data)
            content = data.get('message', '').strip()
        except (json.JSONDecodeError, AttributeError):
            await self.send(text_data=json.dumps({'error': 'Invalid payload.'}))
            return

        if not content:
            return

        message = await self.save_message(content)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type':        'chat_message',   # → calls self.chat_message()
                'message_id':  message.id,
                'content':     content,
                'sender_id':   self.user.id,
                'sender_name': self.user.get_full_name(),
                'created_at':  message.created_at.isoformat(),
            },
        )

    async def chat_message(self, event):
        """
        Called by channel_layer.group_send — pushes event to this WebSocket client.
        """
        await self.send(text_data=json.dumps({
            'type':        'message',
            'message_id':  event['message_id'],
            'content':     event['content'],
            'sender_id':   event['sender_id'],
            'sender_name': event['sender_name'],
            'created_at':  event['created_at'],
        }))

    # ── Database helpers ──────────────────────────────────────────────────────

    @database_sync_to_async
    def get_user_from_token(self):
        """Extract and validate JWT from query string. Returns User or None."""
        try:
            query_string = self.scope.get('query_string', b'').decode()
            params       = dict(p.split('=') for p in query_string.split('&') if '=' in p)
            token_str    = params.get('token', '')
            token        = AccessToken(token_str)
            return User.objects.get(id=token['user_id'])
        except (InvalidToken, TokenError, User.DoesNotExist, Exception):
            return None

    @database_sync_to_async
    def check_participation(self):
        return Conversation.objects.filter(
            id=self.conversation_id,
            participants=self.user,
        ).exists()

    @database_sync_to_async
    def save_message(self, content):
        conversation = Conversation.objects.get(id=self.conversation_id)
        message      = Message.objects.create(
            conversation=conversation,
            sender=self.user,
            content=content,
        )
        conversation.save()  # bump updated_at
        return message
