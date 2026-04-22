"""
apps/core/urls.py
URL patterns for admin project management and activity log.
@author: sshende
"""

from django.urls import path
from .views import AdminProjectListView, AdminProjectDeleteView, ActivityLogListView

urlpatterns = [
    # Admin project management
    path('projects/',          AdminProjectListView.as_view(),   name='admin-project-list'),
    path('projects/<int:pk>/', AdminProjectDeleteView.as_view(), name='admin-project-delete'),

    # Activity log
    path('activity-logs/',     ActivityLogListView.as_view(),    name='admin-activity-log'),
]
