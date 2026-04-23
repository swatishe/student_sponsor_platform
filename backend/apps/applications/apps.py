"""
Django app config for applications app.
Defines the ApplicationsConfig class which sets up the app's name and default auto field type. This configuration is used by Django to manage the applications app, which handles project applications and related functionality in the Student-Sponsor Platform. The app includes models for applications, serializers for API data handling, and views for processing application-related requests. The configuration ensures that the app is properly registered and integrated into the overall Django project.
@author: sshende

"""
from django.apps import AppConfig

class ApplicationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.applications'
    verbose_name = 'Applications'
