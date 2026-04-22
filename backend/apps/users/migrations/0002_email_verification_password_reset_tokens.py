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


def create_tables_if_not_exist(apps, schema_editor):
    schema_editor.execute("""
        CREATE TABLE IF NOT EXISTS email_verification_tokens (
            id bigserial PRIMARY KEY,
            token uuid NOT NULL UNIQUE,
            created_at timestamp with time zone NOT NULL,
            user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE
        );
    """)
    schema_editor.execute("""
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id bigserial PRIMARY KEY,
            token uuid NOT NULL UNIQUE,
            created_at timestamp with time zone NOT NULL,
            used boolean NOT NULL DEFAULT false,
            user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE
        );
    """)


def drop_tables(apps, schema_editor):
    schema_editor.execute("DROP TABLE IF EXISTS email_verification_tokens;")
    schema_editor.execute("DROP TABLE IF EXISTS password_reset_tokens;")


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        # ── Use RunPython with IF NOT EXISTS so re-deploys never crash ────────
        migrations.RunPython(create_tables_if_not_exist, reverse_code=drop_tables),

        # ── Register models with Django's migration state (no DB ops) ─────────
        migrations.SeparateDatabaseAndState(
            state_operations=[
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
            ],
            database_operations=[],  # DB already handled by RunPython above
        ),
    ]