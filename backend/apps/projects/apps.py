"""apps/projects/apps.py — Django app configuration
    ──────────────────────────────
    Projects app configuration. This app manages project creation, listing, and details. It serves as the core component for students to find and apply to projects, and for sponsors/faculty to manage their project offerings. The app includes models for projects, serializers for API interactions, views for handling requests, and URL patterns for routing.
    @author: sshende
    """
from django.apps import AppConfig

# ProjectsConfig defines the configuration for the projects app, setting the default auto field type and the app's name. This is essential for Django to recognize and manage the projects app within the project. The verbose name provides a human-readable name for the app in the Django admin interface. The projects app can be expanded in the future to include additional features such as project categories, tags, or integration with other components of the platform.
class ProjectsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.projects'
    verbose_name = 'Projects'
