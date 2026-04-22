"""apps/messaging/serializers.py
────────────────────────────
Serializers for the Messaging app. Defines how Conversation and Message models are converted to/from JSON for API responses and requests. Includes nested serialization for participants and the last message in a conversation, as well as a custom serializer for starting a new conversation with an initial message. This setup allows for efficient data handling in the messaging API endpoints.  
@author: sshende
"""

from rest_framework import serializers
from .models import Conversation, Message
from apps.users.serializers import UserSerializer

"""MessageSerializer handles serialization of Message instances, including the sender's user information. ConversationSerializer provides a nested representation of participants and the last message in the conversation, along with a count of unread messages for the requesting user. StartConversationSerializer is a simple serializer for initiating a new conversation with a recipient and an initial message."""
class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model  = Message
        fields = ('id', 'conversation', 'sender', 'content', 'is_read', 'created_at')
        read_only_fields = ('sender', 'is_read', 'created_at', 'conversation')

"""ConversationSerializer provides a nested representation of participants and the last message in the conversation, along with a count of unread messages for the requesting user."""
class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model  = Conversation
        fields = ('id', 'participants', 'last_message', 'unread_count', 'updated_at')

    def get_last_message(self, obj):
        msg = obj.messages.last()
        return MessageSerializer(msg).data if msg else None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()

"""StartConversationSerializer is a simple serializer for initiating a new conversation with a recipient and an initial message."""
class StartConversationSerializer(serializers.Serializer):
    recipient_id = serializers.IntegerField()
    message      = serializers.CharField(min_length=0, max_length=5000, allow_blank=True, required=False, default='')

