"""apps/messaging/serializers.py"""

from rest_framework import serializers
from .models import Conversation, Message
from apps.users.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model  = Message
        fields = ('id', 'conversation', 'sender', 'content', 'is_read', 'created_at')
        read_only_fields = ('sender', 'is_read', 'created_at', 'conversation')


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


class StartConversationSerializer(serializers.Serializer):
    recipient_id = serializers.IntegerField()
    message      = serializers.CharField(min_length=1, max_length=5000)
