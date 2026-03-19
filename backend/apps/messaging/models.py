"""
apps/messaging/models.py
─────────────────────────
Conversation + Message models for direct messaging between users.
Uses a Conversation container so one M2M set holds participants.
"""

from django.db import models
from django.conf import settings


class Conversation(models.Model):
    """
    A thread between exactly two participants.
    get_or_create_between() prevents duplicate threads.
    """
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='conversations',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)   # bumped on new message

    class Meta:
        db_table = 'conversations'
        ordering = ['-updated_at']

    def __str__(self):
        names = ', '.join(p.get_full_name() for p in self.participants.all())
        return f'Conversation[{names}]'

    @classmethod
    def get_or_create_between(cls, user1, user2):
        """
        Find an existing 2-person conversation between user1 and user2,
        or create a new one. Returns (conversation, created_bool).
        """
        for conv in cls.objects.filter(participants=user1).filter(participants=user2):
            if conv.participants.count() == 2:
                return conv, False
        conv = cls.objects.create()
        conv.participants.add(user1, user2)
        return conv, True


class Message(models.Model):
    """A single message within a Conversation."""

    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages'
    )
    content    = models.TextField()
    is_read    = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['created_at']

    def __str__(self):
        return f'[{self.sender.get_full_name()}]: {self.content[:60]}'
