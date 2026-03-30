# Student Sponsor Platform — Backend

Django + Django REST Framework + Channels + PostgreSQL + Redis

---

## Overview
Backend service for the Student Sponsor Platform (SSP). Provides REST APIs, authentication, project management, application workflows, and real-time messaging.

---

## Tech Stack
- Django
- Django REST Framework
- PostgreSQL
- Redis
- Django Channels
- JWT Authentication

---

## Local Setup

### 1. Clone Repository
git clone <repo-url>
cd backend

### 2. Create Virtual Environment
python -m venv venv
source venv/bin/activate   (Windows: venv\Scripts\activate)

### 3. Install Dependencies
pip install -r requirements.txt

### 4. Configure Environment Variables (.env)
SECRET_KEY=your_secret_key
DEBUG=True
DB_NAME=ssp_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379
CORS_ALLOWED_ORIGINS=http://localhost:5173

### 5. Run Services
- Start PostgreSQL
- Start Redis

### 6. Apply Migrations
python manage.py migrate

### 7. Create Superuser (Optional)
python manage.py createsuperuser

### 8. Run Server
daphne -b 0.0.0.0 -p 8000 ssp_project.asgi:application

---

## API Base URL
http://localhost:8000/api/v1/

---

## Deployment (Render)

### Build Command
pip install -r requirements.txt

### Start Command
daphne -b 0.0.0.0 -p $PORT ssp_project.asgi:application

### Required Environment Variables
SECRET_KEY
DATABASE_URL
REDIS_URL
ALLOWED_HOSTS=.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app

---

## Notes
- Redis is required for WebSocket messaging
- Use Daphne (not runserver) for full functionality