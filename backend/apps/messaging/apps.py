"""apps/core/apps.py
────────────────────────────
Messaging app configuration. This app can be used for shared utilities, base models, or common functionality across the platform. Currently serves as a placeholder for future messaging features. 
@author: sshende
"""
from django.apps import AppConfig

#  MessagingConfig defines the configuration for the messaging app, setting the default auto field type and the app's name. This is essential for Django to recognize and manage the messaging app within the project. The messaging app can be expanded in the future to include features such as notifications, direct messaging between users, or integration with other communication tools on the platform. The configuration ensures that the app is properly registered and integrated into the overall Django project.
class MessagingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.messaging'
    verbose_name = 'Messaging'
