"""
apps/projects/views.py
───────────────────────
Project CRUD. Sponsors/Faculty create; all authenticated users can list/read.
@author sshende
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import filters

from .models import Project, SavedProject
from .serializers import ProjectSerializer, ProjectListSerializer, SavedProjectSerializer
from apps.users.permissions import IsSponsorOrAdmin


class ProjectListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/projects/   — list (students see only OPEN)
    POST /api/v1/projects/   — create (sponsor/faculty/admin only)
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
            return [permissions.IsAuthenticated(), IsSponsorOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs   = Project.objects.select_related('created_by').all()
        user = self.request.user

        if user.is_student:
            qs = qs.filter(status=Project.Status.OPEN)
        elif user.is_sponsor:
            qs = qs.filter(Q(created_by=user) | Q(status=Project.Status.OPEN))

        tags = self.request.query_params.get('tags')
        if tags:
            for tag in tags.split(','):
                qs = qs.filter(tags__icontains=tag.strip())
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET / PATCH / DELETE /api/v1/projects/<pk>/"""
    queryset           = Project.objects.select_related('created_by').all()
    serializer_class   = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ('PATCH', 'PUT', 'DELETE'):
            if obj.created_by != request.user and not request.user.is_admin_user:
                raise PermissionDenied('Only the project creator can edit or delete this project.')


class MyProjectsView(generics.ListAPIView):
    """GET /api/v1/projects/mine/"""
    serializer_class   = ProjectListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(created_by=self.request.user).order_by('-created_at')


# ── Saved Projects ────────────────────────────────────────────────────────────

class SavedProjectListView(generics.ListAPIView):
    """GET /api/v1/projects/saved/ — all saved projects for current student."""
    serializer_class   = SavedProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            SavedProject.objects
            .filter(student=self.request.user)
            .select_related('project', 'project__created_by')
            .order_by('-saved_at')
        )


class SavedProjectSaveView(APIView):
    """
    GET    /api/v1/projects/<pk>/save/  → { saved: true/false }   check status
    POST   /api/v1/projects/<pk>/save/  → { saved: true }         save project
    DELETE /api/v1/projects/<pk>/save/  → { saved: false }        unsave project

    All three methods on one view so Django only needs one URL pattern.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        """Check whether the current user has saved this project."""
        saved = SavedProject.objects.filter(
            student=request.user, project_id=pk
        ).exists()
        return Response({'saved': saved})

    def post(self, request, pk):
        """Save the project. Idempotent — returns 200 if already saved."""
        project = get_object_or_404(Project, pk=pk)
        _, created = SavedProject.objects.get_or_create(
            student=request.user, project=project
        )
        return Response(
            {'saved': True, 'created': created},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        """Unsave the project. Idempotent — returns 200 even if not saved."""
        deleted, _ = SavedProject.objects.filter(
            student=request.user, project_id=pk
        ).delete()
        return Response({'saved': False, 'deleted': deleted > 0})
