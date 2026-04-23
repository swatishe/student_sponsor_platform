"""
apps/forum/models.py
─────────────────────
DiscussionThread — created by faculty (or admin).
Post             — any authenticated user; supports one level of replies.
@author: sshende
"""

from django.db import models
from django.conf import settings

#   DiscussionThread represents a discussion topic created by faculty or admin users. It includes fields for title, description, department, tags, visibility (who can see the thread), pinned status, closed status, creator, and timestamps. The thread can be filtered by department and tagged for easier discovery. The visibility field allows threads to be restricted to certain user groups (e.g., students only). The is_pinned field allows important threads to be highlighted at the top of the list. The is_closed field indicates whether new posts can be added to the thread. Each thread is associated with a creator (the user who created it) and has a timestamp for when it was created and last updated. The post_count property provides a convenient way to get the number of posts in the thread without needing to manually count them each time.
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


#   Post represents a single post in a discussion thread. It includes fields for the thread it belongs to, the author, an optional parent post (for replies), the content of the post, a flag for whether it has been reported for moderation, and timestamps for when it was created and last updated. The parent field allows for one level of replies to posts, enabling threaded discussions. The is_flagged field can be used to indicate that a post has been reported by users and may require moderator review. Each post is associated with an author (the user who created it) and belongs to a specific discussion thread. The __str__ method provides a simple string representation of the post for debugging purposes.
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
