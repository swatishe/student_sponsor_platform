from django.apps import AppConfig

#   ForumConfig defines the configuration for the forum app, setting the default auto field type and the app's name. This is essential for Django to recognize and manage the forum app within the project. The forum app will handle discussion threads, comments, and related functionality for users to engage in conversations about projects and other topics on the platform. The configuration ensures that the app is properly registered and integrated into the overall Django project.
class ForumConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.forum'
