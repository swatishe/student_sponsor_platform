"""
apps/users/views.py
────────────────────
Key fixes vs previous version:
  1. VerifyEmailView: DoesNotExist now returns HTTP 404 (not 400) so frontend
     can distinguish "not found" from "expired" without parsing the message text.
  2. VerifyEmailView: expired token returns HTTP 410 Gone.
  3. All views: added import logging + debug print of token/URL for local dev.
  4. ResendVerificationView: AllowAny, accepts {email} in body.
@author: sshende
"""

import logging
from django.core.mail import send_mail
from django.conf import settings as django_settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
import uuid    

from .models import (
    StudentProfile, SponsorProfile, FacultyProfile,
    EmailVerificationToken, PasswordResetToken,
)
from .serializers import (
    RegisterSerializer, UserSerializer,
    StudentProfileSerializer, SponsorProfileSerializer,
    FacultyProfileSerializer, ChangePasswordSerializer,
)
from .permissions import IsAdminUser

logger = logging.getLogger(__name__)
User   = get_user_model()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _send(subject, body, to_email):
    """
    Send email.
    - DEBUG=True  → console backend prints to terminal; also logs the body so
      you can copy the link without searching the terminal.
    - DEBUG=False → fail silently so a bad SMTP config doesn't break sign-up.
    """
    try:
        send_mail(
            subject        = subject,
            message        = body,
            from_email     = getattr(django_settings, 'DEFAULT_FROM_EMAIL', 'noreply@ssp.com'),
            recipient_list = [to_email],
            fail_silently  = not django_settings.DEBUG,
        )
    except Exception as e:
        logger.warning('Email send failed to %s: %s', to_email, e)

    # Always log the body in DEBUG so you can grab the link from the terminal
    if django_settings.DEBUG:
        logger.info('\n' + '─'*60 + '\n%s\n' + '─'*60, body)


def _frontend():
    return getattr(django_settings, 'FRONTEND_URL', 'http://localhost:5173')


# ── Registration ──────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """POST /api/v1/users/register/"""
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        token      = EmailVerificationToken.objects.create(user=user)
        verify_url = f"{_frontend()}/verify-email?token={token.token}"

        _send(
            subject  = 'Verify your SSP account',
            body     = (
                f"Hi {user.first_name},\n\n"
                f"Welcome to the Student Sponsor Platform!\n\n"
                f"Verify your email address:\n\n"
                f"{verify_url}\n\n"
                f"This link expires in 24 hours.\n\n"
                f"— SSP Team"
            ),
            to_email = user.email,
        )

        return Response(
            {
                'message': 'Account created! Please check your email to verify your account.',
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


# ── Email Verification ────────────────────────────────────────────────────────

class VerifyEmailView(APIView):
    """
    GET /api/v1/users/verify-email/?token=<uuid>

    Returns distinct HTTP status codes so the frontend doesn't need to
    parse message text:
      200  – verified OK
      400  – token param missing
      404  – token not found in DB (never existed or already deleted)
      410  – token found but expired (>24 hrs)
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        token_str = request.query_params.get('token', '').strip()

        if not token_str:
            return Response(
                {'detail': 'Token is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token_uuid = uuid.UUID(str(token_str))
        except (ValueError, AttributeError):
            return Response(
                {'detail': 'This verification link is invalid or has already been used.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            token = EmailVerificationToken.objects.select_related('user').get(token=token_uuid)
        except EmailVerificationToken.DoesNotExist:
            # 404 — token never existed or was already used/deleted
            return Response(
                {'detail': 'This verification link is invalid or has already been used.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if token.is_expired():
            token.delete()
            # 410 Gone — token existed but has expired
            return Response(
                {'detail': 'This verification link has expired. Please request a new one.'},
                status=status.HTTP_410_GONE,
            )

        token.user.is_verified = True
        token.user.save(update_fields=['is_verified'])
        token.delete()

        return Response({'message': 'Email verified successfully! You can now log in.'})

# ── Resend Verification Email ───────────────────────────────────────────────
class ResendVerificationView(APIView):
    """
    POST /api/v1/users/resend-verification/
    PUBLIC — user is not authenticated right after registration.
    Body: { email }
    Always 200 to prevent enumeration.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()

        try:
            user = User.objects.get(email=email, is_active=True)
            if user.is_verified:
                logger.info('Resend requested for already-verified user: %s', email)
            else:
                EmailVerificationToken.objects.filter(user=user).delete()
                token      = EmailVerificationToken.objects.create(user=user)
                verify_url = f"{_frontend()}/verify-email?token={token.token}"
                logger.info('Resend → new link for %s: %s', email, verify_url)
                _send(
                    subject  = 'Verify your SSP account',
                    body     = (
                        f"Hi {user.first_name},\n\n"
                        f"New verification link:\n\n"
                        f"{verify_url}\n\n"
                        f"Expires in 24 hours.\n\n"
                        f"— SSP Team"
                    ),
                    to_email = user.email,
                )
        except User.DoesNotExist:
            logger.info('Resend requested for unknown email: %s', email)  

        return Response({'message': 'If that email is registered and unverified, a new link has been sent.'})


# ── Password Reset ────────────────────────────────────────────────────────────

class PasswordResetRequestView(APIView):
    """POST /api/v1/users/password-reset/ — Always 200."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        try:
            user = User.objects.get(email=email, is_active=True)
            PasswordResetToken.objects.filter(user=user).delete()
            token     = PasswordResetToken.objects.create(user=user)
            reset_url = f"{_frontend()}/reset-password?token={token.token}"
            _send(
                subject  = 'Reset your SSP password',
                body     = (
                    f"Hi {user.first_name},\n\n"
                    f"Reset your password:\n\n"
                    f"{reset_url}\n\n"
                    f"Expires in 1 hour. Ignore if you didn't request this.\n\n"
                    f"— SSP Team"
                ),
                to_email = user.email,
            )
        except User.DoesNotExist:
            pass
        return Response({'message': 'If that email is registered, a reset link has been sent.'})

#    PasswordResetConfirmView handles POST requests to /api/v1/users/password-reset/confirm/. It expects a token and new password in the request body. The view validates the token, checks if it's expired, and if valid, updates the user's password. It returns appropriate HTTP status codes for different error conditions, such as missing token, invalid token, expired token, and password validation errors. On successful password reset, it deletes the token and returns a success message.
class PasswordResetConfirmView(APIView):
    """POST /api/v1/users/password-reset/confirm/"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token_str = request.data.get('token', '').strip()
        password  = request.data.get('password', '')
        password2 = request.data.get('password2', '')

        if not token_str:
            return Response({'detail': 'Reset token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = PasswordResetToken.objects.select_related('user').get(token=token_str, used=False)
        except PasswordResetToken.DoesNotExist:
            return Response({'detail': 'Invalid or expired reset link.'}, status=status.HTTP_404_NOT_FOUND)

        if token.is_expired():
            token.delete()
            return Response({'detail': 'This reset link has expired. Please request a new one.'}, status=status.HTTP_410_GONE)

        if not password:
            return Response({'password': ['Password is required.']}, status=status.HTTP_400_BAD_REQUEST)
        if password != password2:
            return Response({'password': ['Passwords do not match.']}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(password, token.user)
        except ValidationError as e:
            return Response({'password': e.messages}, status=status.HTTP_400_BAD_REQUEST)

        token.user.set_password(password)
        token.user.save()
        token.delete()
        return Response({'message': 'Password reset successfully. You can now log in.'})


# ── Account ───────────────────────────────────────────────────────────────────

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ChangePasswordView allows authenticated users to change their password by providing their current password and a new password. It validates the current password and ensures the new password meets security requirements before updating it.
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password updated successfully.'})


# ── Profiles ──────────────────────────────────────────────────────────────────
#   UserSerializer is a basic serializer for the User model, exposing fields like id, email, first_name, last_name, full_name (computed), role, is_active, is_verified, and date_joined. The id, email, full_name, and date_joined fields are read-only to prevent changes through the API. The get_full_name method computes the full name by combining the first and last names of the user. This serializer is used as a nested serializer in the profile serializers to include user information within the profile data.
class StudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class   = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile


# #   StudentProfileDetailView is a read-only view that allows sponsors to view the profiles of students. It retrieves a StudentProfile instance based on the primary key provided in the URL and includes nested user information through the StudentProfileSerializer. This view is intended for sponsors to access detailed information about student applicants, while the StudentProfileView allows students to manage their own profiles.
# class StudentProfileDetailView(generics.RetrieveAPIView):
#     queryset           = StudentProfile.objects.select_related('user').all()
#     serializer_class   = StudentProfileSerializer
#     permission_classes = [permissions.IsAuthenticated]

class StudentProfileDetailView(generics.RetrieveAPIView):
    serializer_class   = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user_id = self.kwargs['pk']
        try:
            profile = StudentProfile.objects.select_related('user').get(user__id=user_id)
        except StudentProfile.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Student profile not found.')
        self.check_object_permissions(self.request, profile)
        return profile


#  SponsorProfileView and FacultyProfileView are similar to StudentProfileView but for sponsors and faculty members, respectively. They allow authenticated users to retrieve and update their own profiles. If a profile does not exist for the user, it is automatically created with default values (e.g., an empty company name for sponsors). These views use their respective serializers to handle the profile data, which includes nested user information.
class SponsorProfileView(generics.RetrieveUpdateAPIView):
    serializer_class   = SponsorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = SponsorProfile.objects.get_or_create(
            user=self.request.user, defaults={'company_name': ''}
        )
        return profile

""" SponsorProfileDetailView is a read-only view that allows students to view the profiles of sponsors. It retrieves a SponsorProfile instance based on the primary key provided in the URL and includes nested user information through the SponsorProfileSerializer. This view is intended for students to access detailed information about sponsor project creators, while the SponsorProfileView allows sponsors to manage their own profiles. The get_object method is overridden to query the SponsorProfile based on the user__id field rather than the profile's primary key, allowing the URL to use the user's ID for easier access. If the profile is not found, it raises a 404 Not Found error. The view also checks object permissions to ensure that the requesting user has the appropriate permissions to view the sponsor profile.   """
class SponsorProfileDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/users/sponsors/<user_id>/
    Queries profile by user__id (not profile pk)
    FIXED: Changed from queryset pattern to get_object() to query by user_id
    """
    serializer_class   = SponsorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
 
    def get_object(self):
        user_id = self.kwargs['pk']
        try:
            profile = SponsorProfile.objects.select_related('user').get(user__id=user_id)
        except SponsorProfile.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Sponsor profile not found.')
        self.check_object_permissions(self.request, profile)
        return profile


# FacultyProfileView allows faculty members to retrieve and update their profiles. Similar to SponsorProfileView, it automatically creates a profile if one does not exist for the authenticated user. This view uses the FacultyProfileSerializer to handle the profile data, which includes nested user information.
class FacultyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class   = FacultyProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = FacultyProfile.objects.get_or_create(user=self.request.user)
        return profile
    

# FacultyProfileDetailView is a read-only view that allows students to view the profiles of faculty members. It retrieves a FacultyProfile instance based on the primary key provided in the URL and includes nested user information through the FacultyProfileSerializer. This view is intended for students to access detailed information about faculty project creators.
class FacultyProfileDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/users/faculty/<user_id>/
    Queries profile by user__id (not profile pk)
    FIXED: Changed from queryset pattern to get_object() to query by user_id
    """
    serializer_class   = FacultyProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
 
    def get_object(self):
        user_id = self.kwargs['pk']
        try:
            profile = FacultyProfile.objects.select_related('user').get(user__id=user_id)
        except FacultyProfile.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Faculty profile not found.')
        self.check_object_permissions(self.request, profile)
        return profile



# ── Admin ─────────────────────────────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        qs   = User.objects.all()
        role = self.request.query_params.get('role')
        return qs.filter(role=role) if role else qs

#   AdminUserDetailView allows admin users to retrieve, update, or delete any user account. It includes logging for account activation, deactivation, and deletion actions. The view uses the UserSerializer for data representation and ensures that only admin users have access to these operations. The perform_destroy method logs the deletion of a user account, while the partial_update method logs changes to the user's active status (activation/deactivation) when the is_active field is updated.
class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/v1/users/admin/users/<pk>/

    PATCH with { is_active: false } → logs DEACTIVATE
    PATCH with { is_active: true  } → logs ACTIVATE
    DELETE                          → logs DELETE
    """
    queryset           = User.objects.all()
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    # Lazy import to avoid circular imports at module load time
    @staticmethod
    def _log(request, action, target_user, description):
        try:
            from apps.core.models import log_activity
            log_activity(
                request,
                action        = action,
                resource_type = 'user',
                resource_id   = target_user.pk,
                description   = description,
            )
        except Exception as e:
            logger.warning('ActivityLog write failed: %s', e)

    def perform_destroy(self, instance):
        self._log(
            self.request,
            action      = 'delete',
            target_user = instance,
            description = f'Admin deleted user "{instance.get_full_name()}" ({instance.email})',
        )
        instance.delete()

    def partial_update(self, request, *args, **kwargs):
        instance    = self.get_object()
        was_active  = instance.is_active
        response    = super().partial_update(request, *args, **kwargs)

        # Only log when is_active actually changed
        new_active = request.data.get('is_active')
        if new_active is not None:
            toggled_to = bool(new_active)
            if toggled_to != was_active:
                action = 'activate' if toggled_to else 'deactivate'
                verb   = 'activated' if toggled_to else 'deactivated'
                self._log(
                    request,
                    action      = action,
                    target_user = instance,
                    description = f'Admin {verb} user "{instance.get_full_name()}" ({instance.email})',
                )

        return response
