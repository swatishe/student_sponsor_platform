"""apps/users/urls.py — User & Profile URL patterns"""

from django.urls import path
from .views import (
    RegisterView, CurrentUserView, ChangePasswordView,
    StudentProfileView, StudentProfileDetailView,
    SponsorProfileView, FacultyProfileView,
    AdminUserListView, AdminUserDetailView,
)

urlpatterns = [
    # Account
    path('register/',         RegisterView.as_view(),       name='user-register'),
    path('me/',               CurrentUserView.as_view(),    name='current-user'),
    path('change-password/',  ChangePasswordView.as_view(), name='change-password'),

    # Profiles (authenticated user's own profile)
    path('profile/student/',  StudentProfileView.as_view(), name='student-profile'),
    path('profile/sponsor/',  SponsorProfileView.as_view(), name='sponsor-profile'),
    path('profile/faculty/',  FacultyProfileView.as_view(), name='faculty-profile'),

    # Public student profile (for sponsors viewing applicants)
    path('students/<int:pk>/', StudentProfileDetailView.as_view(), name='student-detail'),

    # Admin
    path('admin/users/',          AdminUserListView.as_view(),   name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]
