"""
apps/applications/views.py
───────────────────────────
Students apply; sponsors/faculty review and update statuses.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Application
from .serializers import ApplicationSerializer, ApplicationStatusSerializer


class ApplyToProjectView(generics.CreateAPIView):
    """
    POST /api/v1/applications/
    Student submits an application. Prevents duplicates.
    Body: { project_id, cover_letter (optional) }
    """
    serializer_class   = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.user.is_student:
            raise PermissionDenied('Only students can apply to projects.')
        serializer.save(student=self.request.user)

    def create(self, request, *args, **kwargs):
        project_id = request.data.get('project_id')
        if Application.objects.filter(student=request.user, project_id=project_id).exists():
            return Response(
                {'detail': 'You have already applied to this project.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().create(request, *args, **kwargs)


class MyApplicationsView(generics.ListAPIView):
    """
    GET /api/v1/applications/mine/
    Returns all of the authenticated student's applications.
    """
    serializer_class   = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            student=self.request.user
        ).select_related('project', 'student', 'project__created_by')


class ProjectApplicationsView(generics.ListAPIView):
    """
    GET /api/v1/applications/project/<project_pk>/
    Sponsor/Faculty/Admin: view all applicants for a project.
    Sponsors/Faculty can only see applicants for their own projects.
    """
    serializer_class   = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_pk = self.kwargs['project_pk']
        user       = self.request.user

        if user.is_admin_user:
            return Application.objects.filter(
                project_id=project_pk
            ).select_related('student', 'project')

        # Sponsor/Faculty: only their own projects
        return Application.objects.filter(
            project_id=project_pk,
            project__created_by=user,
        ).select_related('student', 'project')


class UpdateApplicationStatusView(generics.UpdateAPIView):
    """
    PATCH /api/v1/applications/<pk>/status/
    Sponsor/Faculty/Admin updates status and/or adds notes.
    Body: { status, sponsor_notes (optional) }
    """
    serializer_class   = ApplicationStatusSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_user:
            return Application.objects.all()
        return Application.objects.filter(project__created_by=user)

    def patch(self, request, *args, **kwargs):
        if request.user.is_student:
            raise PermissionDenied('Students cannot update application statuses.')
        return super().patch(request, *args, **kwargs)


class WithdrawApplicationView(generics.DestroyAPIView):
    """
    DELETE /api/v1/applications/<pk>/withdraw/
    Student withdraws their own application (soft delete — sets status to withdrawn).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(student=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = Application.Status.WITHDRAWN
        instance.save()
        return Response(
            {'detail': 'Application withdrawn successfully.'},
            status=status.HTTP_200_OK,
        )
