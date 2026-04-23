"""
apps/forum/serializers.py  
Serializers for the Forum app, handling API requests and responses for discussion threads and posts. This includes serializers for listing threads, viewing thread details, and creating/updating posts. The serializers use nested representations for related user data and include custom fields for post counts and latest post information in threads. Validation is included to ensure that thread visibility and post content meet the required criteria. These serializers are essential for the API endpoints in the forum app to function correctly and provide structured data to clients.
@author: sshende
"""
from rest_framework import serializers
from .models import DiscussionThread, Post
from apps.users.serializers import UserSerializer

#   PostSerializer handles serialization of Post instances, including the sender's user information. ConversationSerializer provides a nested representation of participants and the last message in the conversation, along with a count of unread messages for the requesting user. StartConversationSerializer is a simple serializer for initiating a new conversation with a recipient and an initial message.
class PostSerializer(serializers.ModelSerializer):
    author      = UserSerializer(read_only=True)
    reply_count = serializers.SerializerMethodField()

    class Meta:
        model  = Post
        fields = ['id', 'thread', 'parent', 'author', 'content',
                  'is_flagged', 'reply_count', 'created_at', 'updated_at']
        read_only_fields = ['author', 'is_flagged', 'thread', 'created_at', 'updated_at']

    def get_reply_count(self, obj):
        return obj.replies.count()

#   ThreadListSerializer provides a lightweight representation of DiscussionThread instances for the list view, including the creator's user information, post count, and latest post details. ThreadDetailSerializer extends this with additional fields for the detail view.
class ThreadListSerializer(serializers.ModelSerializer):
    """Lightweight — used for list view."""
    created_by  = UserSerializer(read_only=True)
    post_count  = serializers.SerializerMethodField()
    latest_post = serializers.SerializerMethodField()

    class Meta:
        model  = DiscussionThread
        fields = ['id', 'title', 'department', 'tags', 'visibility',
                  'is_pinned', 'is_closed', 'created_by',
                  'post_count', 'latest_post', 'created_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_post_count(self, obj):
        return obj.posts.count()

    def get_latest_post(self, obj):
        p = obj.posts.order_by('-created_at').first()
        if p:
            return {
                'author':     f"{p.author.first_name} {p.author.last_name}",
                'created_at': p.created_at,
            }
        return None

#   ThreadDetailSerializer extends this with additional fields for the detail view. It includes the thread description and updated_at timestamp, providing a more comprehensive representation of the thread for detailed views. This serializer is used when retrieving a single thread's details, allowing clients to access all relevant information about the thread in one response.   
class ThreadDetailSerializer(ThreadListSerializer):
    """Full — used for detail/create view."""
    class Meta(ThreadListSerializer.Meta):
        fields = ThreadListSerializer.Meta.fields + ['description', 'updated_at']
