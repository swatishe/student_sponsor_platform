"""apps/projects/serializers.py
    ──────────────────────────────
    Serializers for the Projects app. Defines how Project instances are converted to/from JSON for API responses and requests. Includes a lightweight ProjectListSerializer for listing projects with less data, and a full ProjectSerializer for detailed views and creation/updating. Both serializers include nested user information for the creator and a method to return the list of tags. The ProjectSerializer also includes validation to ensure that the deadline is a future date when creating or updating a project.
@author sshende
"""


from rest_framework import serializers
from .models import Project, SavedProject
from apps.users.serializers import UserSerializer

from rest_framework import serializers
from .models import Project, SavedProject
from apps.users.serializers import UserSerializer

"""
    ProjectSerializer is a full serializer for the Project model, used for detailed views and creation/updating. It includes nested user information for the creator, a method to return the list of tags, and validation to ensure that the deadline is a future date. ProjectListSerializer is a lightweight serializer for listing projects with less data, while SavedProjectSerializer nests full project data for saved projects, allowing the frontend to receive all necessary information in one call.
"""
class ProjectSerializer(serializers.ModelSerializer):
    """Full project serializer — used for create/detail."""
    created_by        = UserSerializer(read_only=True)
    tags_list         = serializers.SerializerMethodField()
    application_count = serializers.IntegerField(read_only=True)   # ← removed source='application_count'

    class Meta:
        model            = Project
        fields           = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')

    def get_tags_list(self, obj):
        return obj.get_tags_list()

    def validate_deadline(self, value):
        from django.utils import timezone
        if value and value < timezone.now().date():
            raise serializers.ValidationError('Deadline must be a future date.')
        return value

"""Lightweight serializer for list views."""
class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    created_by = UserSerializer(read_only=True)
    tags_list  = serializers.SerializerMethodField()

    class Meta:
        model  = Project
        fields = (
            'id', 'title', 'project_type', 'status', 'is_paid',
            'stipend', 'tags_list', 'deadline', 'created_by',
            'created_at', 'application_count',
        )

    def get_tags_list(self, obj):
        return obj.get_tags_list()

"""Nests full project data so the frontend gets everything in one call."""
class SavedProjectSerializer(serializers.ModelSerializer):
    """Nests full project data so the frontend gets everything in one call."""
    project  = ProjectListSerializer(read_only=True)
    saved_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model  = SavedProject
        fields = ['id', 'project', 'saved_at']