"""apps/projects/apps.py — Django app configuration
    ──────────────────────────────
    Projects app configuration. This app manages project creation, listing, and details. It serves as the core component for students to find and apply to projects, and for sponsors/faculty to manage their project offerings. The app includes models for projects, serializers for API interactions, views for handling requests, and URL patterns for routing.
    @author: sshende
    """
from django.apps import AppConfig

class ProjectsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.projects'
    verbose_name = 'Projects'
