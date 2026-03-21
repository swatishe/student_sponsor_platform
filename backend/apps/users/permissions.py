"""
apps/users/permissions.py
─────────────────────────
Custom DRF permission classes for role-based access control.
Import and use these in any view's permission_classes list.

@author sshende
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminUser(BasePermission):
    """Allow only admin-role users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_user)


class IsSponsor(BasePermission):
    """Allow only sponsor-role users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_sponsor)


class IsStudent(BasePermission):
    """Allow only student-role users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_student)


class IsFaculty(BasePermission):
    """Allow only faculty-role users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_faculty)


class IsSponsorOrAdmin(BasePermission):
    """Allow sponsor or admin users."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and (request.user.is_sponsor or request.user.is_admin_user)
        )


class IsFacultyOrAdmin(BasePermission):
    """Allow faculty or admin users."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and (request.user.is_faculty or request.user.is_admin_user)
        )


class IsSponsorOrFacultyOrAdmin(BasePermission):
    """Allow sponsor, faculty, or admin users (project creators)."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and (request.user.is_sponsor or request.user.is_faculty or request.user.is_admin_user)
        )


class IsOwnerOrAdmin(BasePermission):
    """Allow object owner or admin — used on profile/object level."""
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_user:
            return True
        # Support both direct user objects and objects with a .user FK
        owner = getattr(obj, 'user', obj)
        return owner == request.user
