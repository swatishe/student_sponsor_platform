"""
apps/users/views.py
────────────────────
Views for registration, current user, profile CRUD, and admin user management.
@author sshende
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .models import StudentProfile, SponsorProfile, FacultyProfile
from .serializers import (
    RegisterSerializer, UserSerializer,
    StudentProfileSerializer, SponsorProfileSerializer,
    FacultyProfileSerializer, ChangePasswordSerializer,
)
from .permissions import IsAdminUser

User = get_user_model()


# ── Auth / Account ────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """
    POST /api/v1/users/register/
    Public. Creates user + role profile. Returns user data on success.
    """
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'message': 'Account created successfully.', 'user': UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class CurrentUserView(APIView):
    """
    GET   /api/v1/users/me/  → return current user's data
    PATCH /api/v1/users/me/  → update name fields
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    """
    POST /api/v1/users/change-password/
    Body: { old_password, new_password }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password updated successfully.'})


# ── Profiles ──────────────────────────────────────────────────────────────────

class StudentProfileView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/v1/users/profile/student/  → own student profile
    PATCH /api/v1/users/profile/student/  → update own profile
    """
    serializer_class   = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile


class StudentProfileDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/users/students/<pk>/
    Public read of a student's profile (sponsors/faculty viewing applicants).
    """
    queryset           = StudentProfile.objects.select_related('user').all()
    serializer_class   = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


class SponsorProfileView(generics.RetrieveUpdateAPIView):
    """
    GET/PATCH /api/v1/users/profile/sponsor/  → own sponsor profile
    """
    serializer_class   = SponsorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = SponsorProfile.objects.get_or_create(
            user=self.request.user, defaults={'company_name': ''}
        )
        return profile


class FacultyProfileView(generics.RetrieveUpdateAPIView):
    """
    GET/PATCH /api/v1/users/profile/faculty/  → own faculty profile
    """
    serializer_class   = FacultyProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = FacultyProfile.objects.get_or_create(user=self.request.user)
        return profile


# ── Admin: User Management ────────────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    """
    GET /api/v1/users/admin/users/?role=student
    Admin only — list all users, filterable by role.
    """
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        qs   = User.objects.all()
        role = self.request.query_params.get('role')
        if role:
            qs = qs.filter(role=role)
        return qs


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/v1/users/admin/users/<pk>/
    Admin only — manage a single user account.
    """
    queryset           = User.objects.all()
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
