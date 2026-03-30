"""apps/core/apps.py
────────────────────────────
Messaging app configuration. This app can be used for shared utilities, base models, or common functionality across the platform. Currently serves as a placeholder for future messaging features. 
@author: sshende
"""
from django.apps import AppConfig

class MessagingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.messaging'
    verbose_name = 'Messaging'
