"""
apps/forum/urls.py  
URL patterns for the Forum app, defining endpoints for discussion threads and posts. This includes routes for listing and creating threads, viewing thread details, managing posts within threads, and admin actions for flagging posts. The URLs are structured to allow for nested resources (e.g., posts within threads) and include appropriate path parameters for identifying specific threads and posts. These URL patterns are essential for the API endpoints in the forum app to function correctly and provide a clear structure for clients to interact with the discussion features of the platform.   
@author: sshende"""
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
