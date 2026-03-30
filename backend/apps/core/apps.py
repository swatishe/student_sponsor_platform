"""apps/core/apps.py
────────────────────────────
Core app configuration. This app can be used for shared utilities, base models, or common functionality across the platform. Currently serves as a placeholder for future core features.
@author: sshende"""
from django.apps import AppConfig

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'
    verbose_name = 'Core'
