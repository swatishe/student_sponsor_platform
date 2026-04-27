#!/usr/bin/env bash
set -o errexit    # exit on any error

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate

# ── Create admin user if it doesn't exist ── 
python manage.py shell -c " 
from apps.users.models import User 
if not User.objects.filter(email='admin@ssp.com').exists(): 
    User.objects.create_superuser(email='studentsponsorplatform@gmail.com', password='Admin@2026', first_name='Admin', last_name='User') 
    print('Admin created') 
else: 
    print('Admin already exists') 
"
