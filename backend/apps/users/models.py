"""
apps/users/models.py
────────────────────
Custom User model (email-based auth) + role-specific profile models
+ EmailVerificationToken for email verification on signup.
"""

import uuid
from datetime import timedelta
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom manager — uses email instead of username."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required.')
        email = self.normalize_email(email)
        user  = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff',     True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role',         User.Role.ADMIN)
        extra_fields.setdefault('is_verified',  True)  # superusers are pre-verified
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Platform User. EMAIL is the unique identifier.
    """

    class Role(models.TextChoices):
        STUDENT = 'student', 'Student'
        SPONSOR = 'sponsor', 'Sponsor'
        FACULTY = 'faculty', 'Faculty'
        ADMIN   = 'admin',   'Admin'

    email      = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name  = models.CharField(max_length=100)
    role       = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT, db_index=True)

    is_active   = models.BooleanField(default=True)
    is_staff    = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)  # True after email verification

    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']

    def __str__(self):
        return f'{self.get_full_name()} <{self.email}> [{self.role}]'

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

    def get_short_name(self):
        return self.first_name

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_sponsor(self):
        return self.role == self.Role.SPONSOR

    @property
    def is_faculty(self):
        return self.role == self.Role.FACULTY

    @property
    def is_admin_user(self):
        return self.role == self.Role.ADMIN


class EmailVerificationToken(models.Model):
    """
    One-time token sent to users on registration to verify their email.
    Expires after 24 hours.
    """
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_tokens')
    token      = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'email_verification_tokens'

    def __str__(self):
        return f'VerificationToken for {self.user.email}'

    def is_expired(self):
        """Token is valid for 24 hours."""
        return timezone.now() > self.created_at + timedelta(hours=24)


class StudentProfile(models.Model):
    user          = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    bio           = models.TextField(blank=True)
    university    = models.CharField(max_length=200, blank=True)
    major         = models.CharField(max_length=200, blank=True)
    gpa           = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    skills        = models.TextField(blank=True, help_text='Comma-separated: Python, React, ML')
    resume        = models.FileField(upload_to='resumes/', null=True, blank=True)
    portfolio_url = models.URLField(blank=True)
    linkedin_url  = models.URLField(blank=True)
    github_url    = models.URLField(blank=True)
    avatar        = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_profiles'

    def __str__(self):
        return f'StudentProfile({self.user.get_full_name()})'

    def get_skills_list(self):
        return [s.strip() for s in self.skills.split(',') if s.strip()]


class SponsorProfile(models.Model):
    user         = models.OneToOneField(User, on_delete=models.CASCADE, related_name='sponsor_profile')
    company_name = models.CharField(max_length=200)
    industry     = models.CharField(max_length=200, blank=True)
    website      = models.URLField(blank=True)
    description  = models.TextField(blank=True)
    logo         = models.ImageField(upload_to='logos/', null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sponsor_profiles'

    def __str__(self):
        return f'SponsorProfile({self.company_name})'


class FacultyProfile(models.Model):
    user               = models.OneToOneField(User, on_delete=models.CASCADE, related_name='faculty_profile')
    department         = models.CharField(max_length=200, blank=True)
    university         = models.CharField(max_length=200, blank=True)
    bio                = models.TextField(blank=True)
    research_interests = models.TextField(blank=True)
    created_at         = models.DateTimeField(auto_now_add=True)
    updated_at         = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'faculty_profiles'

    def __str__(self):
        return f'FacultyProfile({self.user.get_full_name()})'
