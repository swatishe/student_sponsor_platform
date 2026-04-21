"""apps/forum/urls.py  @author: sshende"""
from django.urls import path
from .views import (
    ThreadListCreateView,
    ThreadDetailView,
    PostListCreateView,
    PostRepliesView,
    PostDetailView,
    AdminFlagPostView,
)

urlpatterns = [
    path('threads/',                        ThreadListCreateView.as_view(), name='thread-list'),
    path('threads/<int:pk>/',               ThreadDetailView.as_view(),     name='thread-detail'),
    path('threads/<int:thread_pk>/posts/',  PostListCreateView.as_view(),   name='post-list'),
    path('posts/<int:pk>/',                 PostDetailView.as_view(),       name='post-detail'),
    path('posts/<int:post_pk>/replies/',    PostRepliesView.as_view(),      name='post-replies'),
    path('posts/<int:pk>/flag/',            AdminFlagPostView.as_view(),    name='post-flag'),
]
