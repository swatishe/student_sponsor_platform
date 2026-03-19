"""
apps/applications/models.py
────────────────────────────
Application model. Links a Student to a Project.
unique_together prevents duplicate applications.
"""

from django.db import models
from django.conf import settings
from apps.projects.models import Project


class Application(models.Model):

    class Status(models.TextChoices):
        PENDING   = 'pending',   'Pending'
        REVIEWING = 'reviewing', 'Under Review'
        ACCEPTED  = 'accepted',  'Accepted'
        REJECTED  = 'rejected',  'Rejected'
        WITHDRAWN = 'withdrawn', 'Withdrawn'

    # ── Relations ─────────────────────────────────────────────
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications',
        limit_choices_to={'role': 'student'},
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='applications',
    )

    # ── Submission ────────────────────────────────────────────
    cover_letter  = models.TextField(blank=True)
    resume        = models.FileField(upload_to='application_resumes/', null=True, blank=True)

    # ── Status tracking ───────────────────────────────────────
    status        = models.CharField(
        max_length=20, choices=Status.choices,
        default=Status.PENDING, db_index=True,
    )
    sponsor_notes = models.TextField(blank=True, help_text='Private notes from reviewer')

    # ── Timestamps ────────────────────────────────────────────
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table       = 'applications'
        ordering       = ['-applied_at']
        unique_together = ('student', 'project')  # One application per student per project
        verbose_name   = 'Application'
        verbose_name_plural = 'Applications'

    def __str__(self):
        return f'{self.student.get_full_name()} → {self.project.title} [{self.status}]'
