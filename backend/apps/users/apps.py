from django.apps import AppConfig
from django.contrib.auth import get_user_model


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'
    verbose_name = 'Users'

    def ready(self):
        User = get_user_model()

        if not User.objects.filter(email="sshende1@umbc.edu").exists():
            User.objects.create_superuser(
                email="sshende1@umbc.edu",
                password="swatishe123",
                first_name="Admin",
                last_name="User"
            )