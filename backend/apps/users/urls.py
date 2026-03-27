"""apps/users/urls.py — User & Profile URL patterns"""

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
