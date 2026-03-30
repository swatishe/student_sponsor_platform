"""apps/users/apps.py — Django app configuration
    ──────────────────────────────
    Users app configuration. This app manages user registration, authentication, and profile management. It serves as the core component for handling user accounts, including students, sponsors, and faculty. The app includes models for user profiles, serializers for API interactions, views for handling requests, and URL patterns for routing. It also integrates with Django's built-in authentication system and can be extended to include additional user-related functionality as needed.
    @author: sshende    
    """
from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'
    verbose_name = 'Users'