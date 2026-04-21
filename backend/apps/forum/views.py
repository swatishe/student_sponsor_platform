"""
apps/forum/views.py
────────────────────
Thread CRUD + Post CRUD + flag endpoint.
@author: sshende
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from .models import DiscussionThread, Post
from .serializers import ThreadListSerializer, ThreadDetailSerializer, PostSerializer
from apps.users.permissions import IsFacultyOrAdmin, IsAdminUser


class ThreadListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/forum/threads/   – list threads (all authenticated)
    POST /api/v1/forum/threads/   – create thread (faculty or admin only)
    Query params: ?department=CS
    """
    def get_serializer_class(self):
        return ThreadDetailSerializer if self.request.method == 'POST' else ThreadListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsFacultyOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs   = DiscussionThread.objects.select_related('created_by').all()
        dept = self.request.query_params.get('department', '').strip()
        if dept:
            qs = qs.filter(department__icontains=dept)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ThreadDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/forum/threads/<pk>/
    PATCH  /api/v1/forum/threads/<pk>/  – owner or admin
    DELETE /api/v1/forum/threads/<pk>/  – owner or admin
    """
    queryset         = DiscussionThread.objects.select_related('created_by').all()
    serializer_class = ThreadDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ('PATCH', 'PUT', 'DELETE'):
            if obj.created_by != request.user and not request.user.is_admin_user:
                raise PermissionDenied('Only the thread creator or admin can edit this thread.')


class PostListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/forum/threads/<thread_pk>/posts/  – top-level posts
    POST /api/v1/forum/threads/<thread_pk>/posts/  – any authenticated user
    """
    serializer_class   = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(
            thread_id=self.kwargs['thread_pk'], parent=None
        ).select_related('author')

    def perform_create(self, serializer):
        thread = get_object_or_404(DiscussionThread, pk=self.kwargs['thread_pk'])
        if thread.is_closed:
            raise PermissionDenied('This thread is closed and no longer accepts posts.')
        serializer.save(author=self.request.user, thread=thread)


class PostRepliesView(generics.ListCreateAPIView):
    """
    GET  /api/v1/forum/posts/<post_pk>/replies/
    POST /api/v1/forum/posts/<post_pk>/replies/
    """
    serializer_class   = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(
            parent_id=self.kwargs['post_pk']
        ).select_related('author')

    def perform_create(self, serializer):
        parent = get_object_or_404(Post, pk=self.kwargs['post_pk'])
        if parent.thread.is_closed:
            raise PermissionDenied('This thread is closed and no longer accepts posts.')
        serializer.save(author=self.request.user, thread=parent.thread, parent=parent)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    PATCH  /api/v1/forum/posts/<pk>/  – edit own post
    DELETE /api/v1/forum/posts/<pk>/  – delete own post or admin
    """
    queryset           = Post.objects.select_related('author', 'thread').all()
    serializer_class   = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ('PATCH', 'PUT', 'DELETE'):
            if obj.author != request.user and not request.user.is_admin_user:
                raise PermissionDenied('You can only edit or delete your own posts.')


class AdminFlagPostView(APIView):
    """
    PATCH /api/v1/forum/posts/<pk>/flag/
    Admin toggles is_flagged on a post.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def patch(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        post.is_flagged = not post.is_flagged
        post.save(update_fields=['is_flagged'])
        return Response({'id': post.id, 'is_flagged': post.is_flagged})
