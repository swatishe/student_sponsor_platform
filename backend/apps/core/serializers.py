"""
apps/core/serializers.py
@author: sshende
"""

from rest_framework import serializers
from .models import ActivityLog

#       ActivityLogSerializer is used to serialize ActivityLog entries for API responses. It includes all fields of the ActivityLog model and marks them as read-only since logs should not be modified through the API. This serializer can be used in admin views or audit endpoints to display activity logs in a structured format. 
class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ActivityLog
        fields = [
            'id', 'actor_name', 'actor_role',
            'action', 'resource_type', 'resource_id',
            'description', 'ip_address', 'timestamp',
        ]
        read_only_fields = fields


# ── Lightweight project serializer for the admin project list ─────────────────
# Importing from apps.projects to avoid duplication — only what admin list needs.
# We define it here so core/ has no circular imports with projects/.

from apps.projects.models import Project  # noqa: E402  (after stdlib imports)

# AdminProjectSerializer provides a lightweight representation of Project instances for the admin project list view. It includes essential fields such as id, title, project_type, status, application_count, created_by (with nested user info), and created_at. The created_by field is a SerializerMethodField that retrieves and formats the creator's user information without needing to import the full UserSerializer, thus avoiding circular imports between core/ and projects/. This serializer is optimized for displaying project summaries in the admin interface while still providing relevant details about the creator.   
class AdminProjectSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()

    class Meta:
        model  = Project
        fields = [
            'id', 'title', 'project_type', 'status',
            'application_count', 'created_by', 'created_at',
        ]

    def get_created_by(self, obj):
        u = obj.created_by
        if not u:
            return None
        return {
            'id':         u.id,
            'first_name': u.first_name,
            'last_name':  u.last_name,
            'email':      u.email,
            'role':       u.role,
        }
