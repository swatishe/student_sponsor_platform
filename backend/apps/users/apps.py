"""apps/users/apps.py — Django app configuration
    ──────────────────────────────
    Users app configuration. This app manages user registration, authentication, and profile management. It serves as the core component for handling user accounts, including students, sponsors, and faculty. The app includes models for user profiles, serializers for API interactions, views for handling requests, and URL patterns for routing. It also integrates with Django's built-in authentication system and can be extended to include additional user-related functionality as needed.
    @author: sshende    
    """
from django.apps import AppConfig

""" UsersConfig defines the configuration for the users app, setting the default auto field type and the app's name. This is essential for Django to recognize and manage the users app within the project. The verbose name provides a human-readable name for the app in the Django admin interface. The users app can be expanded in the future to include additional features such as user roles, permissions, or integration with other components of the platform. """
class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'
    verbose_name = 'Users'