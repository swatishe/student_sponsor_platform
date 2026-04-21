"""apps/forum/serializers.py  @author: sshende"""
from rest_framework import serializers
from .models import DiscussionThread, Post
from apps.users.serializers import UserSerializer


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


class ThreadDetailSerializer(ThreadListSerializer):
    """Full — used for detail/create view."""
    class Meta(ThreadListSerializer.Meta):
        fields = ThreadListSerializer.Meta.fields + ['description', 'updated_at']
