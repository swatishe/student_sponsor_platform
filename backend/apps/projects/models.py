"""
apps/projects/models.py
────────────────────────
Project model. Created by Sponsors or Faculty.
Students browse and apply to open projects.
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

    # ── Relations ─────────────────────────────────────────────
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='projects',
    )

    # ── Core fields ───────────────────────────────────────────
    title        = models.CharField(max_length=300, db_index=True)
    description  = models.TextField()
    requirements = models.TextField(blank=True)
    project_type = models.CharField(
        max_length=50, choices=ProjectType.choices,
        default=ProjectType.INTERNSHIP, db_index=True,
    )
    status = models.CharField(
        max_length=20, choices=Status.choices,
        default=Status.OPEN, db_index=True,
    )

    # ── Compensation ──────────────────────────────────────────
    is_paid = models.BooleanField(default=False, db_index=True)
    stipend = models.CharField(max_length=100, blank=True)

    # ── Discovery ─────────────────────────────────────────────
    tags          = models.TextField(blank=True, help_text='Comma-separated: Python, React, ML')
    max_applicants= models.PositiveIntegerField(default=0, help_text='0 = unlimited')
    deadline      = models.DateField(null=True, blank=True)

    # ── Timestamps ────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'projects'
        ordering = ['-created_at']
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'

    def __str__(self):
        return f'{self.title} [{self.status}]'

    def get_tags_list(self):
        return [t.strip() for t in self.tags.split(',') if t.strip()]

    @property
    def application_count(self):
        return self.applications.count()
