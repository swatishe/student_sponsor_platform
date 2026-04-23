"""apps/applications/serializers.py"""
"""Application serializers for handling API requests and responses.
@author: sshende
"""

from rest_framework import serializers
from .models import Application
from apps.users.serializers import UserSerializer
from apps.projects.serializers import ProjectListSerializer

#   Full application — includes nested student + project. 
class ApplicationSerializer(serializers.ModelSerializer):
    """Full application — includes nested student + project."""

    student    = UserSerializer(read_only=True)
    project    = ProjectListSerializer(read_only=True)
    project_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__('apps.projects.models', fromlist=['Project']).Project.objects.all(),
        write_only=True,
        source='project',
    )

    class Meta:
        model  = Application
        fields = '__all__'
        read_only_fields = ('student', 'status', 'applied_at', 'updated_at')

    def validate(self, attrs):
        project = attrs.get('project')
        if project and project.status != 'open':
            raise serializers.ValidationError(
                {'project_id': 'This project is not currently accepting applications.'}
            )
        return attrs

# Minimal serializer for sponsor/faculty to update status + notes.  Used in ApplicationsReviewView to prevent overposting.
class ApplicationStatusSerializer(serializers.ModelSerializer):
    """Minimal serializer for sponsor/faculty to update status + notes."""

    class Meta:
        model  = Application
        fields = ('id', 'status', 'sponsor_notes')
