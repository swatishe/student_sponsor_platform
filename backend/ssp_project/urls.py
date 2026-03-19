"""
SSP Root URL Configuration
All API endpoints are versioned under /api/v1/
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

urlpatterns = [
    # ── Django Admin ─────────────────────────────────────────
    path('admin/', admin.site.urls),

    # ── JWT Authentication ────────────────────────────────────
    path('api/v1/auth/login/',   TokenObtainPairView.as_view(),  name='token_obtain_pair'),
    path('api/v1/auth/refresh/', TokenRefreshView.as_view(),     name='token_refresh'),
    path('api/v1/auth/logout/',  TokenBlacklistView.as_view(),   name='token_blacklist'),

    # ── App routes ────────────────────────────────────────────
    path('api/v1/users/',        include('apps.users.urls')),
    path('api/v1/projects/',     include('apps.projects.urls')),
    path('api/v1/applications/', include('apps.applications.urls')),
    path('api/v1/messages/',     include('apps.messaging.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
