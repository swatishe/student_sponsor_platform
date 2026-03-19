"""
apps/projects/views.py
───────────────────────
Project CRUD. Sponsors/Faculty create; all authenticated users can list/read.
"""

from rest_framework import generics, permissions, filters
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Project
from .serializers import ProjectSerializer, ProjectListSerializer
from apps.users.permissions import IsSponsorOrFacultyOrAdmin


class ProjectListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/projects/         — list projects (search, filter, paginate)
    POST /api/v1/projects/         — create project (sponsor / faculty / admin)

    Query params:
      ?search=python               full-text search on title/description/tags
      ?status=open                 filter by status
      ?project_type=internship     filter by type
      ?is_paid=true                filter paid opportunities
      ?tags=Python,ML              filter by tag(s) — comma separated
    """
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'project_type', 'is_paid']
    search_fields    = ['title', 'description', 'tags', 'requirements']
    ordering_fields  = ['created_at', 'deadline', 'title']
    ordering         = ['-created_at']

    def get_serializer_class(self):
        return ProjectListSerializer if self.request.method == 'GET' else ProjectSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsSponsorOrFacultyOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs   = Project.objects.select_related('created_by').all()
        user = self.request.user

        # Students only see OPEN projects
        if user.is_student:
            qs = qs.filter(status=Project.Status.OPEN)
        elif user.is_sponsor or user.is_faculty:
            # Owners see all their own; plus open ones from others
            qs = qs.filter(Q(created_by=user) | Q(status=Project.Status.OPEN))

        # Multi-tag filter: ?tags=Python,ML
        tags = self.request.query_params.get('tags')
        if tags:
            for tag in tags.split(','):
                qs = qs.filter(tags__icontains=tag.strip())

        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/projects/<pk>/  — retrieve
    PATCH  /api/v1/projects/<pk>/  — update  (owner or admin)
    DELETE /api/v1/projects/<pk>/  — delete  (owner or admin)
    """
    queryset           = Project.objects.select_related('created_by').all()
    serializer_class   = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ('PATCH', 'PUT', 'DELETE'):
            if obj.created_by != request.user and not request.user.is_admin_user:
                raise PermissionDenied('Only the project creator can modify this project.')


class MyProjectsView(generics.ListAPIView):
    """
    GET /api/v1/projects/mine/
    Returns projects created by the authenticated user.
    """
    serializer_class   = ProjectListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(created_by=self.request.user).order_by('-created_at')
