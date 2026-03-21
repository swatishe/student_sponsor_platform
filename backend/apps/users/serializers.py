"""
apps/users/serializers.py
──────────────────────────
Serializers for User registration, profile CRUD, and password change.
@author sshende
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, StudentProfile, SponsorProfile, FacultyProfile


class RegisterSerializer(serializers.ModelSerializer):
    """Used for POST /api/v1/users/register/ — creates user + auto-creates profile."""

    password  = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label='Confirm password')

    class Meta:
        model  = User
        fields = ('email', 'first_name', 'last_name', 'role', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Auto-create the matching profile record
        if user.is_student:
            StudentProfile.objects.create(user=user)
        elif user.is_sponsor:
            SponsorProfile.objects.create(user=user, company_name='')
        elif user.is_faculty:
            FacultyProfile.objects.create(user=user)

        return user


class UserSerializer(serializers.ModelSerializer):
    """Lightweight read serializer — safe to nest inside other serializers."""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ('id', 'email', 'first_name', 'last_name', 'full_name',
                  'role', 'is_active', 'is_verified', 'date_joined')
        read_only_fields = ('id', 'email', 'full_name', 'date_joined')

    def get_full_name(self, obj):
        return obj.get_full_name()


class StudentProfileSerializer(serializers.ModelSerializer):
    """Full student profile — includes nested user info + skills list."""

    user        = UserSerializer(read_only=True)
    skills_list = serializers.SerializerMethodField()

    class Meta:
        model  = StudentProfile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

    def get_skills_list(self, obj):
        return obj.get_skills_list()


class SponsorProfileSerializer(serializers.ModelSerializer):
    """Full sponsor profile."""

    user = UserSerializer(read_only=True)

    class Meta:
        model  = SponsorProfile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')


class FacultyProfileSerializer(serializers.ModelSerializer):
    """Full faculty profile."""

    user = UserSerializer(read_only=True)

    class Meta:
        model  = FacultyProfile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')


class ChangePasswordSerializer(serializers.Serializer):
    """Used for POST /api/v1/users/change-password/"""

    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True,
                                          validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value
