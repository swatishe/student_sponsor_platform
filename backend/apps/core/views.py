"""
apps/core/views.py
────────────────────
Admin-only views for:
  • GET/DELETE  /api/v1/admin/projects/          — list all projects
  • DELETE      /api/v1/admin/projects/<pk>/     — delete a specific project
  • GET         /api/v1/admin/activity-logs/     — paginated activity log with filters

All views require IsAuthenticated + IsAdminUser.
Deleting a project or user automatically writes an ActivityLog entry.
@author: sshende
"""

from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from apps.projects.models import Project
from apps.users.permissions import IsAdminUser
from .models import ActivityLog, log_activity
from .serializers import ActivityLogSerializer, AdminProjectSerializer

User = get_user_model()


# ── Admin: Project list + delete ──────────────────────────────────────────────
# AdminProjectListView provides a paginated list of all projects with optional filtering by status and project type, as well as search by title and creator name. AdminProjectDeleteView allows admins to delete a specific project by its primary key (id) and automatically logs this action in the ActivityLog for auditing purposes. Both views are protected by IsAuthenticated and IsAdminUser permissions to ensure that only authorized admin users can access these endpoints. The serializers used in these views provide a structured representation of the project data for API responses.  
class AdminProjectListView(generics.ListAPIView):
    """
    GET /api/v1/admin/projects/
    Query params: status, project_type
    """
    serializer_class   = AdminProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['status', 'project_type']
    search_fields      = ['title', 'created_by__first_name', 'created_by__last_name']
    ordering_fields    = ['created_at', 'title']
    ordering           = ['-created_at']

    def get_queryset(self):
        return Project.objects.select_related('created_by').all()


# AdminProjectDeleteView allows admins to delete a specific project by its primary key (id) and automatically logs this action in the ActivityLog for auditing purposes. Both views are protected by IsAuthenticated and IsAdminUser permissions to ensure that only authorized admin users can access these endpoints. The serializers used in these views provide a structured representation of the project data for API responses.
class AdminProjectDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/v1/admin/projects/<pk>/
    Logs the deletion to ActivityLog.
    """
    queryset           = Project.objects.all()
    serializer_class   = AdminProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def perform_destroy(self, instance):
        log_activity(
            self.request,
            action        = ActivityLog.Action.DELETE,
            resource_type = 'project',
            resource_id   = instance.pk,
            description   = f'Admin deleted project "{instance.title}" (id={instance.pk})',
        )
        instance.delete()


# ── Admin: Activity log ───────────────────────────────────────────────────────
#       ActivityLogListView provides a paginated list of activity log entries with optional filtering by action type, resource type, and free-text search on actor name and description. This view is protected by IsAuthenticated and IsAdminUser permissions to ensure that only authorized admin users can access the activity logs for auditing purposes. The ActivityLogSerializer is used to serialize the log entries for API responses, providing a structured representation of the activity data. Admins can use this endpoint to monitor platform activity, investigate issues, and maintain an audit trail of important actions taken on the platform over time.    
class ActivityLogListView(generics.ListAPIView):
    """
    GET /api/v1/admin/activity-logs/
    Query params: action, resource_type, actor (name search)
    Ordered newest-first, paginated (PAGE_SIZE from settings, default 20).
    """
    serializer_class   = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['action', 'resource_type']
    search_fields      = ['actor_name', 'description']
    ordering_fields    = ['timestamp']
    ordering           = ['-timestamp']

    def get_queryset(self):
        qs = ActivityLog.objects.all()

        # Optional free-text filter on actor name via ?actor=<name>
        actor = self.request.query_params.get('actor', '').strip()
        if actor:
            qs = qs.filter(actor_name__icontains=actor)

        return qs
