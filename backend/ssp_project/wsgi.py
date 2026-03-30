"""
SSP WSGI Configuration
Used by gunicorn for HTTP-only deployments (no WebSocket support).
For WebSocket support use daphne with asgi.py instead.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ssp_project.settings')
application = get_wsgi_application()
