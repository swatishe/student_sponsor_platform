"""
apps/projects/models.py
────────────────────────
Project model. Created by Sponsors or Faculty.
Students browse and apply to open projects.
@author sshende
"""

from django.db import models
from django.conf import settings


class Project(models.Model):

    class Status(models.TextChoices):
        DRAFT     = 'draft',     'Draft'
        OPEN      = 'open',      'Open'
        CLOSED    = 'closed',    'Closed'
        COMPLETED = 'completed', 'Completed'

    class ProjectType(models.TextChoices):
        INTERNSHIP = 'internship', 'Internship'
        RESEARCH   = 'research',   'Research'
        PART_TIME  = 'part_time',  'Part-Time'
        FULL_TIME  = 'full_time',  'Full-Time'
        FREELANCE  = 'freelance',  'Freelance'
        CAPSTONE   = 'capstone',   'Capstone'

    created_by   = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='projects'
    )
    title        = models.CharField(max_length=300)
    description  = models.TextField()
    requirements = models.TextField(blank=True)
    project_type = models.CharField(max_length=50, choices=ProjectType.choices, default=ProjectType.INTERNSHIP)
    status       = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    is_paid      = models.BooleanField(default=False)
    stipend      = models.CharField(max_length=100, blank=True)
    tags         = models.TextField(blank=True)
    max_applicants = models.PositiveIntegerField(default=0)
    deadline     = models.DateField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'projects'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} — {self.status}'

    def get_tags_list(self):
        return [t.strip() for t in self.tags.split(',') if t.strip()]

    @property
    def application_count(self):
        return self.applications.count()


class SavedProject(models.Model):
    """
    A student saves/bookmarks a project to revisit later.
    unique_together on (student, project) prevents duplicate saves.
    """
    student    = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_projects',
        limit_choices_to={'role': 'student'},
    )
    project    = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='saves',
    )
    saved_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table       = 'saved_projects'
        unique_together = [('student', 'project')]   # prevents duplicates
        ordering        = ['-saved_at']

    def __str__(self):
        return f'{self.student.email} saved "{self.project.title}"'
