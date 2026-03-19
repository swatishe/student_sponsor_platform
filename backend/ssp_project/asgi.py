"""
SSP ASGI Configuration
──────────────────────
Routes both HTTP (Django views) and WebSocket (Django Channels)
connections through a single ASGI application.

Start with:
    daphne -b 0.0.0.0 -p 8000 ssp_project.asgi:application
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ssp_project.settings')

# django.setup() must be called before importing any app modules
django.setup()

from django.core.asgi import get_asgi_application          # noqa: E402
from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402
from channels.auth import AuthMiddlewareStack               # noqa: E402
from channels.security.websocket import AllowedHostsOriginValidator  # noqa: E402
from apps.messaging.routing import websocket_urlpatterns    # noqa: E402

application = ProtocolTypeRouter({
    # Standard HTTP → Django views
    'http': get_asgi_application(),

    # WebSocket → Django Channels (JWT auth applied in consumer)
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})
