"""apps/messaging/routing.py — WebSocket URL routing
────────────────────────────
Defines WebSocket URL patterns for the Messaging app, routing chat-related WebSocket connections to the appropriate consumer. Currently, it includes a single route for chat conversations, which captures the conversation ID from the URL and passes it to the ChatConsumer. This setup allows for real-time messaging functionality between users in the platform.
@author: sshende
"""
from django.urls import re_path
from .consumers import ChatConsumer

#  websocket_urlpatterns defines the WebSocket URL patterns for the Messaging app, routing chat-related WebSocket connections to the ChatConsumer. The route captures the conversation ID from the URL, allowing the consumer to manage real-time messaging for specific conversations. This setup is essential for enabling real-time communication features within the platform, ensuring that messages are properly routed to the correct conversation channels based on the conversation ID provided in the WebSocket connection URL.   
websocket_urlpatterns = [
    # ws://host/ws/chat/42/?token=<JWT>
    re_path(r'ws/chat/(?P<conversation_id>\d+)/$', ChatConsumer.as_asgi()),
]
