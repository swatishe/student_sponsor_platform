"""
apps/forum/models.py
─────────────────────
DiscussionThread — created by faculty (or admin).
Post             — any authenticated user; supports one level of replies.
@author: sshende
"""

from django.db import models
from django.conf import settings


class DiscussionThread(models.Model):

    class Visibility(models.TextChoices):
        ALL        = 'all',        'All Users'
        STUDENTS   = 'students',   'Students Only'
        DEPARTMENT = 'department', 'Department Only'

    title       = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    department  = models.CharField(max_length=200, blank=True, help_text='Filter by department')
    tags        = models.CharField(max_length=300, blank=True)
    visibility  = models.CharField(max_length=20, choices=Visibility.choices, default=Visibility.ALL)
    is_pinned   = models.BooleanField(default=False)
    is_closed   = models.BooleanField(default=False)
    created_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='threads'
    )
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'discussion_threads'
        ordering = ['-is_pinned', '-created_at']

    def __str__(self):
        return self.title

    @property
    def post_count(self):
        return self.posts.count()


class Post(models.Model):
    thread     = models.ForeignKey(DiscussionThread, on_delete=models.CASCADE, related_name='posts')
    author     = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forum_posts'
    )
    parent     = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies'
    )
    content    = models.TextField()
    is_flagged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'forum_posts'
        ordering = ['created_at']

    def __str__(self):
        return f'Post by {self.author.email} on "{self.thread.title}"'
