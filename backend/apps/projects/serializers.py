"""apps/projects/serializers.py"""

from rest_framework import serializers
from django.utils import timezone
from .models import Project
from apps.users.serializers import UserSerializer


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing projects (less data over the wire)."""

    created_by        = UserSerializer(read_only=True)
    tags_list         = serializers.SerializerMethodField()
    application_count = serializers.IntegerField(read_only=True, source='application_count')

    class Meta:
        model  = Project
        fields = (
            'id', 'title', 'project_type', 'status', 'is_paid', 'stipend',
            'tags_list', 'deadline', 'created_by', 'created_at', 'application_count',
        )

    def get_tags_list(self, obj):
        return obj.get_tags_list()


class ProjectSerializer(serializers.ModelSerializer):
    """Full project serializer — used for create, retrieve, and update."""

    created_by        = UserSerializer(read_only=True)
    tags_list         = serializers.SerializerMethodField()
    application_count = serializers.IntegerField(read_only=True, source='application_count')

    class Meta:
        model  = Project
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')

    def get_tags_list(self, obj):
        return obj.get_tags_list()

    def validate_deadline(self, value):
        if value and value < timezone.now().date():
            raise serializers.ValidationError('Deadline must be a future date.')
        return value
