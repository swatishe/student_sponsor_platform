"""
apps/core/models.py
────────────────────
ActivityLog — one row per platform action (create, update, delete, login, etc.)
Written automatically via the log_activity() helper called from views.
@author: sshende
"""

from django.db import models
from django.conf import settings

#   ActivityLog records all important actions on the platform, such as creating/updating/deleting projects, applying to projects, user logins/logouts, and admin actions. Each log entry captures who did it (actor), what they did (action), on what resource (resource_type + resource_id), when they did it (timestamp), and from where (ip_address). The log_activity() helper function can be called from any view to easily create a new log entry without needing to manually construct the ActivityLog object each time. This centralized logging mechanism is crucial for auditing, debugging, and monitoring platform activity over time.
class ActivityLog(models.Model):

    class Action(models.TextChoices):
        CREATE     = 'create',     'Create'
        UPDATE     = 'update',     'Update'
        DELETE     = 'delete',     'Delete'
        LOGIN      = 'login',      'Login'
        LOGOUT     = 'logout',     'Logout'
        ACTIVATE   = 'activate',   'Activate'
        DEACTIVATE = 'deactivate', 'Deactivate'

    # Who did it (nullable so logs survive user deletion)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='activity_logs',
    )

    # Denormalised so logs remain readable after the actor is deleted
    actor_name = models.CharField(max_length=200, blank=True)
    actor_role = models.CharField(max_length=50,  blank=True)

    action        = models.CharField(max_length=20, choices=Action.choices, db_index=True)
    resource_type = models.CharField(max_length=100, blank=True, db_index=True)  # e.g. "user", "project"
    resource_id   = models.CharField(max_length=100, blank=True)                 # pk as string
    description   = models.TextField(blank=True)                                 # human-readable summary

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp  = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'activity_logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f'[{self.timestamp:%Y-%m-%d %H:%M}] {self.actor_name} {self.action} {self.resource_type} {self.resource_id}'


# ── Convenience helper ────────────────────────────────────────────────────────

def log_activity(request_or_user, action, resource_type='', resource_id='', description=''):
    """
    Call this from any view to record an action.

    Usage:
        log_activity(request, ActivityLog.Action.DELETE, 'project', str(project.pk),
                     f'Deleted project "{project.title}"')

    Accepts either a DRF request object or a User instance as the first arg.
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()

    # Accept both request objects and raw user instances
    if hasattr(request_or_user, 'user'):
        actor      = request_or_user.user if request_or_user.user.is_authenticated else None
        ip         = _get_ip(request_or_user)
    elif isinstance(request_or_user, User):
        actor = request_or_user
        ip    = None
    else:
        actor = None
        ip    = None

    ActivityLog.objects.create(
        actor         = actor,
        actor_name    = actor.get_full_name() if actor else 'Anonymous',
        actor_role    = actor.role            if actor else '',
        action        = action,
        resource_type = resource_type,
        resource_id   = str(resource_id),
        description   = description,
        ip_address    = ip,
    )


def _get_ip(request):
    """Extract real IP, handling proxies."""
    xff = request.META.get('HTTP_X_FORWARDED_FOR')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')
