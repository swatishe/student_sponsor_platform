"""
apps/users/views.py
────────────────────
Views for registration (with email verification), current user,
profile CRUD, and admin user management.
@author sshende
"""

import uuid
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .models import StudentProfile, SponsorProfile, FacultyProfile, EmailVerificationToken
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
    Public. Creates user + role profile, then sends a verification email.
    """
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # ── Send verification email ──────────────────────────────────────
        try:
            token = EmailVerificationToken.objects.create(user=user)
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            verify_url   = f"{frontend_url}/verify-email?token={token.token}"

            send_mail(
                subject='Verify your SSP account',
                message=(
                    f"Hi {user.first_name},\n\n"
                    f"Thanks for signing up to the Student Sponsor Platform!\n\n"
                    f"Please verify your email address by clicking the link below:\n\n"
                    f"{verify_url}\n\n"
                    f"This link expires in 24 hours.\n\n"
                    f"If you didn't create this account, please ignore this email.\n\n"
                    f"— SSP Team"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,   # don't crash registration if email fails
            )
        except Exception:
            pass  # registration still succeeds even if email fails

        return Response(
            {
                'message': 'Account created! Please check your email to verify your account.',
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(APIView):
    """
    GET /api/v1/users/verify-email/?token=<uuid>
    Public. Marks user as verified when they click the email link.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        token_str = request.query_params.get('token')
        if not token_str:
            return Response({'detail': 'Token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = EmailVerificationToken.objects.select_related('user').get(token=token_str)
        except EmailVerificationToken.DoesNotExist:
            return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check expiry (24 hours)
        if token.is_expired():
            token.delete()
            return Response({'detail': 'This link has expired. Please register again.'}, status=status.HTTP_400_BAD_REQUEST)

        # Mark user as verified
        token.user.is_verified = True
        token.user.save(update_fields=['is_verified'])
        token.delete()  # one-time use

        return Response({'message': 'Email verified successfully! You can now log in.'})


class ResendVerificationView(APIView):
    """
    POST /api/v1/users/resend-verification/
    Authenticated. Resends the verification email if not yet verified.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.is_verified:
            return Response({'detail': 'Email is already verified.'}, status=status.HTTP_400_BAD_REQUEST)

        # Delete old tokens for this user
        EmailVerificationToken.objects.filter(user=user).delete()

        token        = EmailVerificationToken.objects.create(user=user)
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        verify_url   = f"{frontend_url}/verify-email?token={token.token}"

        send_mail(
            subject='Verify your SSP account',
            message=(
                f"Hi {user.first_name},\n\n"
                f"Click the link below to verify your email:\n\n"
                f"{verify_url}\n\n"
                f"This link expires in 24 hours.\n\n"
                f"— SSP Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response({'message': 'Verification email sent.'})


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
    """GET/PATCH /api/v1/users/profile/student/"""
    serializer_class   = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile


class StudentProfileDetailView(generics.RetrieveAPIView):
    """GET /api/v1/users/students/<pk>/ — public student profile for sponsors"""
    queryset           = StudentProfile.objects.select_related('user').all()
    serializer_class   = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


class SponsorProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/users/profile/sponsor/"""
    serializer_class   = SponsorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = SponsorProfile.objects.get_or_create(
            user=self.request.user, defaults={'company_name': ''}
        )
        return profile


class FacultyProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/users/profile/faculty/"""
    serializer_class   = FacultyProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = FacultyProfile.objects.get_or_create(user=self.request.user)
        return profile


# ── Admin ─────────────────────────────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    """GET /api/v1/users/admin/users/?role=student"""
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        qs   = User.objects.all()
        role = self.request.query_params.get('role')
        if role:
            qs = qs.filter(role=role)
        return qs


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/v1/users/admin/users/<pk>/"""
    queryset           = User.objects.all()
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
