from django.contrib.auth import get_user_model

User = get_user_model()

if not User.objects.filter(email='studentsponsorplatform@gmail.com').exists():
    User.objects.create_superuser(
        email='studentsponsorplatform@gmail.com',
        password='Admin@2026',
        first_name='Admin',
        last_name='User',
        is_verified=True,
        role='admin'
    )
    print('Admin created successfully')
else:
    print('Admin already exists')