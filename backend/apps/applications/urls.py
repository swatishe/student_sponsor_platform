"""apps/applications/urls.py"""
from django.urls import path
from .views import (
    ApplyToProjectView, MyApplicationsView,
    ProjectApplicationsView, UpdateApplicationStatusView,
    WithdrawApplicationView,
)

urlpatterns = [
    path('',                              ApplyToProjectView.as_view(),         name='apply-project'),
    path('mine/',                         MyApplicationsView.as_view(),         name='my-applications'),
    path('project/<int:project_pk>/',     ProjectApplicationsView.as_view(),    name='project-applications'),
    path('<int:pk>/status/',              UpdateApplicationStatusView.as_view(), name='update-app-status'),
    path('<int:pk>/withdraw/',            WithdrawApplicationView.as_view(),     name='withdraw-application'),
]
