"""
apps/core/urls.py
URL patterns for admin project management and activity log.
@author: sshende
"""

from django.urls import path
from .views import AdminProjectListView, AdminProjectDeleteView, ActivityLogListView

# URL patterns for the Core app, including admin project management and activity log endpoints. These views allow admins to list and delete projects, as well as view the activity log for auditing purposes. The URLs are prefixed with 'admin/' in the main URL configuration to indicate that they are part of the admin tools provided by the core app. 
urlpatterns = [
    # Admin project management
    path('projects/',          AdminProjectListView.as_view(),   name='admin-project-list'),
    path('projects/<int:pk>/', AdminProjectDeleteView.as_view(), name='admin-project-delete'),

    # Activity log
    path('activity-logs/',     ActivityLogListView.as_view(),    name='admin-activity-log'),
]
