"""
apps/projects/migrations/0002_savedproject.py
Creates the saved_projects table.
Run: python manage.py migrate
"""

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        # Must come after the initial projects migration
        ('projects', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SavedProject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('saved_at', models.DateTimeField(auto_now_add=True)),
                ('student', models.ForeignKey(
                    limit_choices_to={'role': 'student'},
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='saved_projects',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('project', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='saves',
                    to='projects.project',
                )),
            ],
            options={
                'db_table': 'saved_projects',
                'ordering': ['-saved_at'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='savedproject',
            unique_together={('student', 'project')},
        ),
    ]
