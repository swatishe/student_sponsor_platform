"""apps/users/urls.py — User & Profile URL patterns
    ──────────────────────────────
Defines URL patterns for user registration, authentication, profile management, and admin user management. This includes endpoints for registering a new user, verifying email addresses, resending verification emails, retrieving/updating the current user's profile, changing passwords, and viewing/updating profiles for students, sponsors, and faculty. It also includes admin endpoints for listing all users and retrieving/updating individual user details. Each endpoint is associated with a specific view that handles the corresponding functionality, allowing users to interact with their accounts and profiles through the API.
@author: sshende"""

from django.urls import path
from .views import (
    RegisterView, VerifyEmailView, ResendVerificationView,
    CurrentUserView, ChangePasswordView,
    StudentProfileView, StudentProfileDetailView,
    SponsorProfileView, FacultyProfileView,
    AdminUserListView, AdminUserDetailView,
)

urlpatterns = [
    # Auth
    path('register/',              RegisterView.as_view(),            name='user-register'),
    path('verify-email/',          VerifyEmailView.as_view(),         name='verify-email'),
    path('resend-verification/',   ResendVerificationView.as_view(),  name='resend-verification'),
    path('me/',                    CurrentUserView.as_view(),         name='current-user'),
    path('change-password/',       ChangePasswordView.as_view(),      name='change-password'),

    # Profiles (own)
    path('profile/student/',  StudentProfileView.as_view(), name='student-profile'),
    path('profile/sponsor/',  SponsorProfileView.as_view(), name='sponsor-profile'),  # ← was missing
    path('profile/faculty/',  FacultyProfileView.as_view(), name='faculty-profile'),

    # Public student detail (for sponsors)
    path('students/<int:pk>/', StudentProfileDetailView.as_view(), name='student-detail'),

    # Admin
    path('admin/users/',          AdminUserListView.as_view(),   name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]
