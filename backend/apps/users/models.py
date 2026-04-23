"""
apps/users/models.py
────────────────────
Custom User model (email-based auth) + role-specific profile models
+ EmailVerificationToken + PasswordResetToken (with `used` field).
@author: sshende

FIX: Added `used = models.BooleanField(default=False)` to PasswordResetToken.
     views.py queries `.get(token=x, used=False)` — without this field the
     query raises FieldError → 500.
"""

import uuid
from datetime import timedelta
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone


"""Custom user model with email as the unique identifier. Includes role-based profiles for students, sponsors, and faculty. Also defines one-time token models for email verification and password reset, with appropriate fields and methods for handling token expiration and usage. The UserManager class provides methods for creating regular users and superusers, ensuring that the necessary fields are set correctly. The overall structure allows for flexible user management while maintaining security and functionality for authentication and account management within the platform.   
"""
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
        extra_fields.setdefault('is_verified',  True)
        return self.create_user(email, password, **extra_fields)

"""Platform User. EMAIL is the unique identifier."""
class User(AbstractBaseUser, PermissionsMixin):
    """Platform User. EMAIL is the unique identifier."""

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
    is_verified = models.BooleanField(default=False)

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
    def is_student(self):    return self.role == self.Role.STUDENT
    @property
    def is_sponsor(self):    return self.role == self.Role.SPONSOR
    @property
    def is_faculty(self):    return self.role == self.Role.FACULTY
    @property
    def is_admin_user(self): return self.role == self.Role.ADMIN



"""One-time token for email verification. Expires after 24 hours."""
class EmailVerificationToken(models.Model):
    """One-time token for email verification. Expires after 24 hours."""

    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_tokens')
    token      = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'email_verification_tokens'

    def __str__(self):
        return f'VerificationToken for {self.user.email}'

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(hours=24)


"""One-time token emailed to users who request a password reset. Expires after 1 hour. Deleted on use. `used` field added to prevent reuse of tokens and avoid FieldError in views.py.  """
class PasswordResetToken(models.Model):
    """
    One-time token emailed to users who request a password reset.
    Expires after 1 hour. Deleted on use.

    FIX: `used` field added — views.py filters on `used=False` to reject
    already-used tokens. Without this field, the query raises FieldError → 500.
    """

    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token      = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    used       = models.BooleanField(default=False)   # ← THIS WAS MISSING

    class Meta:
        db_table = 'password_reset_tokens'

    def __str__(self):
        return f'PasswordResetToken for {self.user.email}'

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(hours=1)


""" StudentProfile extends the User model with student-specific fields like bio, university, major, GPA, skills, resume, and social links. SponsorProfile extends the User model with sponsor-specific fields like company name, industry, website, description, and logo. FacultyProfile extends the User model with faculty-specific fields like department, university, bio, and research interests. Each profile is linked to the User model via a one-to-one relationship, allowing for easy access to user information while keeping role-specific data organized in separate models. This structure supports the different types of users on the platform while maintaining a clean and scalable design."""
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

""" SponsorProfile extends the User model with sponsor-specific fields like company name, industry, website, description, and logo. FacultyProfile extends the User model with faculty-specific fields like department, university, bio, and research interests. Each profile is linked to the User model via a one-to-one relationship, allowing for easy access to user information while keeping role-specific data organized in separate models. This structure supports the different types of users on the platform while maintaining a clean and scalable design."""
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

""" FacultyProfile extends the User model with faculty-specific fields like department, university, bio, and research interests. Each profile is linked to the User model via a one-to-one relationship, allowing for easy access to user information while keeping role-specific data organized in separate models. This structure supports the different types of users on the platform while maintaining a clean and scalable design."""
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
