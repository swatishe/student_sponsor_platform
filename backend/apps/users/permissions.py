"""
apps/users/permissions.py
─────────────────────────
Custom DRF permission classes for role-based access control.
Import and use these in any view's permission_classes list.

@author sshende
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS

# Custom permissions for role-based access control. Each class checks the user's role and authentication status to determine if they have permission to access a view. These can be used in any view's permission_classes list to enforce role-specific access control throughout the platform. For example, IsSponsorOrAdmin can be used to allow only sponsors and admins to access certain views, while IsOwnerOrAdmin can be used to restrict access to object owners and admins. This modular approach allows for flexible and maintainable permission management across the application.
class IsAdminUser(BasePermission):
    """Allow only admin-role users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_user)


#   Convenience properties on User model (is_student, is_sponsor, is_faculty) allow for easy role checks in permissions without needing to compare against Role values directly.
class IsSponsor(BasePermission):
    """Allow only sponsor-role users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_sponsor)


#   Convenience properties on User model (is_student, is_sponsor, is_faculty) allow for easy role checks in permissions without needing to compare against Role values directly.
class IsStudent(BasePermission):
    """Allow only student-role users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_student)


#   Convenience properties on User model (is_student, is_sponsor, is_faculty) allow for easy role checks in permissions without needing to compare against Role values directly.
class IsFaculty(BasePermission):
    """Allow only faculty-role users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_faculty)


#   Convenience properties on User model (is_student, is_sponsor, is_faculty) allow for easy role checks in permissions without needing to compare against Role values directly.
class IsSponsorOrAdmin(BasePermission):
    """Allow sponsor or admin users."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and (request.user.is_sponsor or request.user.is_admin_user)
        )


#   Convenience properties on User model (is_student, is_sponsor, is_faculty) allow for easy role checks in permissions without needing to compare against Role values directly.
class IsFacultyOrAdmin(BasePermission):
    """Allow faculty or admin users."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and (request.user.is_faculty or request.user.is_admin_user)
        )


#  Convenience properties on User model (is_student, is_sponsor, is_faculty) allow for easy role checks in permissions without needing to compare against Role values directly.
class IsSponsorOrFacultyOrAdmin(BasePermission):
    """Allow sponsor, faculty, or admin users (project creators)."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and (request.user.is_sponsor or request.user.is_faculty or request.user.is_admin_user)
        )


#  Checks if the user is the owner of the object or an admin. Used for profile/object-level permissions to restrict access to owners and admins while allowing flexibility for different types of objects (e.g., user profiles, projects, applications) by checking for a direct user object or a related user field.
class IsOwnerOrAdmin(BasePermission):
    """Allow object owner or admin — used on profile/object level."""
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_user:
            return True
        # Support both direct user objects and objects with a .user FK
        owner = getattr(obj, 'user', obj)
        return owner == request.user
