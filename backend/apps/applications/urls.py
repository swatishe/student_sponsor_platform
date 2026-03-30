"""apps/applications/urls.py"""
"""
URL patterns for the Applications app. Defines endpoints for applying to projects, viewing applications, and updating application status.
@author sshende
"""
from django.urls import path
from .views import (
    ApplyToProjectView, MyApplicationsView,
    ProjectApplicationsView, UpdateApplicationStatusView,
    WithdrawApplicationView,
)

# URL patterns for the Applications app
urlpatterns = [
    path('',                              ApplyToProjectView.as_view(),         name='apply-project'),
    path('mine/',                         MyApplicationsView.as_view(),         name='my-applications'),
    path('project/<int:project_pk>/',     ProjectApplicationsView.as_view(),    name='project-applications'),
    path('<int:pk>/status/',              UpdateApplicationStatusView.as_view(), name='update-app-status'),
    path('<int:pk>/withdraw/',            WithdrawApplicationView.as_view(),     name='withdraw-application'),
]
