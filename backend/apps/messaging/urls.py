"""apps/messaging/urls.py — REST URL patterns"""
from django.urls import path
from .views import (
    ConversationListView, StartConversationView,
    MessageListView, SendMessageView,
)

urlpatterns = [
    path('conversations/',                              ConversationListView.as_view(),  name='conversation-list'),
    path('start/',                                      StartConversationView.as_view(), name='start-conversation'),
    path('conversations/<int:conv_id>/messages/',       MessageListView.as_view(),       name='message-list'),
    path('conversations/<int:conv_id>/send/',           SendMessageView.as_view(),       name='send-message'),
]
