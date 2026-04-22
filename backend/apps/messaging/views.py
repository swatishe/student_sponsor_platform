"""
apps/messaging/views.py
────────────────────────
REST views for conversations and messages.
Real-time delivery is handled by WebSocket consumers (consumers.py).
@author: sshende
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, StartConversationSerializer

User = get_user_model()

"""ConversationListView returns all conversations the current user participates in, ordered by most recently updated. StartConversationView allows a user to start a new conversation (or retrieve an existing one) with a specified recipient and send the first message. MessageListView returns the message history for a given conversation and marks received messages as read. SendMessageView provides a REST endpoint for sending a message to a conversation when WebSocket is unavailable."""
class ConversationListView(generics.ListAPIView):
    """
    GET /api/v1/messages/conversations/
    Returns all conversations the current user participates in.
    """
    serializer_class   = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Conversation.objects
            .filter(participants=self.request.user)
            .prefetch_related('participants', 'messages')
            .order_by('-updated_at')
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

""" StartConversationView allows a user to start a new conversation (or retrieve an existing one) with a specified recipient and send the first message. MessageListView returns the message history for a given conversation and marks received messages as read. SendMessageView provides a REST endpoint for sending a message to a conversation when WebSocket is unavailable. """
class StartConversationView(APIView):
    """
    POST /api/v1/messages/start/
    Start a new conversation (or return existing one) and send the first message.
    Body: { recipient_id: int, message: str }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = StartConversationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        recipient_id = serializer.validated_data['recipient_id']
        content      = serializer.validated_data['message']

        try:
            recipient = User.objects.get(pk=recipient_id)
        except User.DoesNotExist:
            return Response({'detail': 'Recipient not found.'}, status=status.HTTP_404_NOT_FOUND)

        if recipient == request.user:
            return Response({'detail': 'Cannot message yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        conversation, created = Conversation.get_or_create_between(request.user, recipient)

        # Create the opening message
        if content:
            Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=content,
            )
            conversation.save()  # bump updated_at


        return Response(
            ConversationSerializer(conversation, context={'request': request}).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

"""MessageListView returns the message history for a given conversation and marks received messages as read. SendMessageView provides a REST endpoint for sending a message to a conversation when WebSocket is unavailable."""
class MessageListView(generics.ListAPIView):
    """
    GET /api/v1/messages/conversations/<conv_id>/messages/
    Returns message history and marks received messages as read.
    """
    serializer_class   = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conv_id      = self.kwargs['conv_id']
        conversation = Conversation.objects.filter(
            id=conv_id, participants=self.request.user
        ).first()
        if not conversation:
            return Message.objects.none()

        # Mark received messages as read
        Message.objects.filter(
            conversation=conversation, is_read=False
        ).exclude(sender=self.request.user).update(is_read=True)

        return Message.objects.filter(conversation=conversation).select_related('sender')

"""SendMessageView provides a REST endpoint for sending a message to a conversation when WebSocket is unavailable."""
class SendMessageView(generics.CreateAPIView):
    """
    POST /api/v1/messages/conversations/<conv_id>/send/
    REST fallback for sending a message when WebSocket is unavailable.
    Body: { content: str }
    """
    serializer_class   = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        conv_id      = self.kwargs['conv_id']
        conversation = Conversation.objects.filter(
            id=conv_id, participants=self.request.user
        ).first()
        if not conversation:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You are not a participant in this conversation.')
        serializer.save(sender=self.request.user, conversation=conversation)
        conversation.save()
