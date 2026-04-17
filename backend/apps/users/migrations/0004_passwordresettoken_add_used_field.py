"""
apps/users/migrations/0003_passwordresettoken_add_used_field.py

Adds the `used` boolean field to the password_reset_tokens table.
This field is required by views.py which filters: .get(token=x, used=False)

Run: python manage.py migrate
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        # Depends on the migration that created the password_reset_tokens table
        ('users', '0002_email_verification_password_reset_tokens'),
    ]

    operations = [
        migrations.AddField(
            model_name='passwordresettoken',
            name='used',
            field=models.BooleanField(default=False),
        ),
    ]
