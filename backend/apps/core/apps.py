"""apps/core/apps.py
────────────────────────────
Core app configuration. This app can be used for shared utilities, base models, or common functionality across the platform. Currently serves as a placeholder for future core features.
@author: sshende"""
from django.apps import AppConfig

#   CoreConfig defines the configuration for the core app, setting the default auto field type and the app's name. This is essential for Django to recognize and manage the core app within the project. The verbose name provides a human-readable name for the app in the Django admin interface.  
class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name               = 'apps.core'
    verbose_name       = 'Core / Admin Tools'
