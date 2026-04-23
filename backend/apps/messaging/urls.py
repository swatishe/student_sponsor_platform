"""apps/messaging/urls.py — REST URL patterns
    ──────────────────────────────
    URL patterns for the Messaging app. Defines endpoints for listing conversations, starting new conversations, listing        messages in a conversation, and sending messages. Each endpoint is associated with a specific view that handles the corresponding functionality, allowing users to interact with their conversations and messages through the API.  
    @author: sshende
    """
from django.urls import path
from .views import (
    ConversationListView, StartConversationView,
    MessageListView, SendMessageView,
)

# URL patterns for the Messaging app, defining endpoints for listing conversations, starting new conversations, listing messages in a conversation, and sending messages. Each endpoint is associated with a specific view that handles the corresponding functionality, allowing users to interact with their conversations and messages through the API.
urlpatterns = [
    path('conversations/',                              ConversationListView.as_view(),  name='conversation-list'),
    path('start/',                                      StartConversationView.as_view(), name='start-conversation'),
    path('conversations/<int:conv_id>/messages/',       MessageListView.as_view(),       name='message-list'),
    path('conversations/<int:conv_id>/send/',           SendMessageView.as_view(),       name='send-message'),
]
