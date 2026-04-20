"""
apps/users/migrations/0002_email_verification_password_reset_tokens.py

Creates the two token tables needed for:
  - Email verification on registration
  - Forgot / reset password flow

Run:  python manage.py migrate
"""

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        # Must come after the initial users migration
        ('users', '0001_initial'),
    ]

    operations = [
        # ── Email verification token ──────────────────────────────────────────
        migrations.CreateModel(
            name='EmailVerificationToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='verification_tokens',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'db_table': 'email_verification_tokens'},
        ),

        # ── Password reset token ──────────────────────────────────────────────
        migrations.CreateModel(
            name='PasswordResetToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('used', models.BooleanField(default=False)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='password_reset_tokens',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'db_table': 'password_reset_tokens'},
        ),
    ]
