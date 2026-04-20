"""
apps/users/views_admin.py
──────────────────────────
Admin-only views mounted at /api/v1/admin/
  GET  /api/v1/admin/users/           – list users (search/role/active filter)
  GET/PATCH/DELETE /api/v1/admin/users/<pk>/
  GET  /api/v1/admin/projects/        – list all projects
  DELETE /api/v1/admin/projects/<pk>/ – delete inappropriate project
  GET  /api/v1/admin/stats/           – platform counts
  GET  /api/v1/admin/activity/        – recent registrations + projects

@author: sshende
"""

import logging
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Count, Q

from .serializers import UserSerializer
from .permissions import IsAdminUser
from apps.projects.models import Project
from apps.projects.serializers import ProjectListSerializer
from apps.applications.models import Application

logger = logging.getLogger(__name__)
User   = get_user_model()


# ── Users ─────────────────────────────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    """
    GET /api/v1/admin/users/
    Query params: ?role=student  ?search=jane  ?is_active=true/false
    """
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        qs     = User.objects.all().order_by('-date_joined')
        role   = self.request.query_params.get('role', '').strip()
        search = self.request.query_params.get('search', '').strip()
        active = self.request.query_params.get('is_active', '').strip()

        if role:
            qs = qs.filter(role=role)
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)  |
                Q(email__icontains=search)
            )
        if active:
            qs = qs.filter(is_active=(active.lower() == 'true'))
        return qs


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/admin/users/<pk>/
    PATCH  /api/v1/admin/users/<pk>/  – deactivate: { is_active: false }
    DELETE /api/v1/admin/users/<pk>/  – permanently delete
    """
    queryset           = User.objects.all()
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response(
                {'detail': 'You cannot delete your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        logger.info('Admin %s deleted user %s', request.user.email, user.email)
        return super().destroy(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        user = self.get_object()
        if 'is_active' in request.data:
            action = 'activated' if request.data['is_active'] else 'deactivated'
            logger.info('Admin %s %s user %s', request.user.email, action, user.email)
        return super().partial_update(request, *args, **kwargs)


# ── Projects ──────────────────────────────────────────────────────────────────

class AdminProjectListView(generics.ListAPIView):
    """
    GET /api/v1/admin/projects/
    Query params: ?search=title  ?status=open
    """
    serializer_class   = ProjectListSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        qs     = Project.objects.select_related('created_by').order_by('-created_at')
        search = self.request.query_params.get('search', '').strip()
        stat   = self.request.query_params.get('status', '').strip()
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))
        if stat:
            qs = qs.filter(status=stat)
        return qs


class AdminProjectDetailView(generics.RetrieveDestroyAPIView):
    """
    GET    /api/v1/admin/projects/<pk>/
    DELETE /api/v1/admin/projects/<pk>/  – remove inappropriate content
    """
    queryset           = Project.objects.select_related('created_by').all()
    serializer_class   = ProjectListSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        project = self.get_object()
        logger.info('Admin %s deleted project "%s" (id=%s)', request.user.email, project.title, project.id)
        return super().destroy(request, *args, **kwargs)


# ── Statistics ────────────────────────────────────────────────────────────────

class AdminStatsView(APIView):
    """GET /api/v1/admin/stats/"""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        role_counts = {r['role']: r['total']   for r in User.objects.values('role').annotate(total=Count('id'))}
        proj_counts = {p['status']: p['total'] for p in Project.objects.values('status').annotate(total=Count('id'))}

        return Response({
            'users': {
                'total':    User.objects.count(),
                'active':   User.objects.filter(is_active=True).count(),
                'inactive': User.objects.filter(is_active=False).count(),
                'verified': User.objects.filter(is_verified=True).count(),
                'student':  role_counts.get('student', 0),
                'sponsor':  role_counts.get('sponsor', 0),
                'faculty':  role_counts.get('faculty', 0),
                'admin':    role_counts.get('admin',   0),
            },
            'projects': {
                'total':     Project.objects.count(),
                'open':      proj_counts.get('open',      0),
                'closed':    proj_counts.get('closed',    0),
                'draft':     proj_counts.get('draft',     0),
                'completed': proj_counts.get('completed', 0),
            },
            'applications': {
                'total':    Application.objects.count(),
                'pending':  Application.objects.filter(status='pending').count(),
                'accepted': Application.objects.filter(status='accepted').count(),
            },
        })


# ── Activity Log ──────────────────────────────────────────────────────────────

class AdminActivityView(APIView):
    """
    GET /api/v1/admin/activity/
    Returns last 10 registrations + last 10 projects.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        recent_users    = User.objects.order_by('-date_joined')[:10]
        recent_projects = Project.objects.select_related('created_by').order_by('-created_at')[:10]

        return Response({
            'recent_users': UserSerializer(recent_users, many=True).data,
            'recent_projects': [
                {
                    'id':         p.id,
                    'title':      p.title,
                    'status':     p.status,
                    'created_by': f"{p.created_by.first_name} {p.created_by.last_name}",
                    'created_at': p.created_at.isoformat(),
                }
                for p in recent_projects
            ],
        })