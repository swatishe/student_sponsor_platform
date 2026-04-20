"""
apps/core/serializers.py
@author: sshende
"""

from rest_framework import serializers
from .models import ActivityLog


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
