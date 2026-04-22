"""apps/forum/migrations/0001_initial.py"""
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='DiscussionThread',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=300)),
                ('description', models.TextField(blank=True)),
                ('department', models.CharField(blank=True, max_length=200)),
                ('tags', models.CharField(blank=True, max_length=300)),
                ('visibility', models.CharField(
                    choices=[('all','All Users'),('students','Students Only'),('department','Department Only')],
                    default='all', max_length=20,
                )),
                ('is_pinned', models.BooleanField(default=False)),
                ('is_closed', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='threads',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'db_table': 'discussion_threads', 'ordering': ['-is_pinned', '-created_at']},
        ),
        migrations.CreateModel(
            name='Post',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('content', models.TextField()),
                ('is_flagged', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('thread', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='posts',
                    to='forum.discussionthread',
                )),
                ('author', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='forum_posts',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('parent', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='replies',
                    to='forum.post',
                )),
            ],
            options={'db_table': 'forum_posts', 'ordering': ['created_at']},
        ),
    ]
