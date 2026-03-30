"""
apps/projects/urls.py
    ──────────────────────────────
URL patterns for the Projects app. Defines endpoints for listing/creating projects, viewing project details,and listing projects created by the current user. Each endpoint is associated with a specific view that handles the corresponding functionality, allowing users to interact with projects through the API.  
@author sshende
"""
from django.urls import path
from .views import ProjectListCreateView, ProjectDetailView, MyProjectsView

urlpatterns = [
    path('',          ProjectListCreateView.as_view(), name='project-list-create'),
    path('mine/',     MyProjectsView.as_view(),        name='my-projects'),
    path('<int:pk>/', ProjectDetailView.as_view(),     name='project-detail'),
]
