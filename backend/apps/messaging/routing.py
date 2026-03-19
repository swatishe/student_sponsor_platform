"""apps/messaging/routing.py — WebSocket URL routing"""
from django.urls import re_path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    # ws://host/ws/chat/42/?token=<JWT>
    re_path(r'ws/chat/(?P<conversation_id>\d+)/$', ChatConsumer.as_asgi()),
]
