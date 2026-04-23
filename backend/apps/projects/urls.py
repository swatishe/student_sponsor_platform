"""
apps/projects/urls.py
    ──────────────────────────────
URL patterns for the Projects app. Defines endpoints for listing/creating projects, viewing project details,and listing projects created by the current user. Each endpoint is associated with a specific view that handles the corresponding functionality, allowing users to interact with projects through the API.  
@author sshende
"""
from django.urls import path
from .views import (
    ProjectListCreateView,
    ProjectDetailView,
    MyProjectsView,
    SavedProjectListView,
    SavedProjectSaveView, 
)

"""URL patterns for the Projects app, defining endpoints for listing/creating projects, viewing project details,and listing projects created by the current user. Each endpoint is associated with a specific view that handles the corresponding functionality, allowing users to interact with projects through the API. The core project endpoints include:
- '' (GET, POST): Lists all projects or creates a new project.
- 'mine/' (GET): Lists projects created by the current user.
- 'saved/' (GET): Lists projects saved by the current user.
- '<int:pk>/' (GET, PUT, DELETE): Retrieves, updates, or deletes a specific project by its primary key.
- '<int:pk>/save/' (POST): Toggles the saved status of a project for the current user, allowing them to bookmark or unbookmark projects they are interested in. This setup provides a comprehensive API for managing projects within the platform, enabling"""
urlpatterns = [
    # Core project endpoints
    path('',       ProjectListCreateView.as_view(), name='project-list-create'),
    path('mine/',  MyProjectsView.as_view(),        name='my-projects'),
    path('saved/', SavedProjectListView.as_view(),  name='saved-projects'),

    path('<int:pk>/',      ProjectDetailView.as_view(),    name='project-detail'),
    path('<int:pk>/save/', SavedProjectSaveView.as_view(), name='project-save'),  
]
