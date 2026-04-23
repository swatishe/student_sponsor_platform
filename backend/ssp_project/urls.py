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
"""
    SSP Root URL Configuration. All API endpoints are versioned under /api/v1/. This file defines the main URL patterns for the project, including routes for the Django admin interface, JWT authentication endpoints, and the various app-specific routes for users, projects, applications, messaging, and admin tools. It also includes a route for the discussion forum. In development mode, it serves media files as well. Each app's URLs are included using the include() function, allowing for modular organization of the API endpoints. The JWT authentication endpoints provide token-based authentication for secure access to the API, while the admin route allows for administrative management of the platform. The structure is designed to be scalable and maintainable as the project grows.      
        
"""
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

    # ── Admin tools (projects + activity log) ─────────────────  
    path('api/v1/admin/',        include('apps.core.urls')),

    # Discussion forum
    path('api/v1/forum/',        include('apps.forum.urls')),   
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
