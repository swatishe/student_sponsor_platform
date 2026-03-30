# SSP Backend — Complete Step-by-Step Setup Guide

## Project Structure

```
backend/
├── manage.py                          ← Django CLI entry point
├── requirements.txt                   ← All Python dependencies
├── runtime.txt                        ← Python version for Heroku
├── .env.example                       ← Environment variable template
├── .env                               ← Your local config (copy from .env.example)
├── .gitignore
│
├── ssp_project/                       ← Django project package
│   ├── __init__.py
│   ├── settings.py                    ← All settings (DB, JWT, CORS, Channels)
│   ├── urls.py                        ← Root URL config — all /api/v1/ routes
│   ├── asgi.py                        ← ASGI app (HTTP + WebSocket via Channels)
│   └── wsgi.py                        ← WSGI app (HTTP only, for gunicorn)
│
└── apps/
    ├── users/                         ← Custom User + Profiles
    │   ├── models.py                  ← User, StudentProfile, SponsorProfile, FacultyProfile
    │   ├── serializers.py             ← Register, UserSerializer, ProfileSerializers
    │   ├── views.py                   ← Register, Me, Profiles, Admin user CRUD
    │   ├── permissions.py             ← IsStudent, IsSponsor, IsFaculty, IsAdminUser…
    │   └── urls.py
    │
    ├── projects/                      ← Project CRUD
    │   ├── models.py                  ← Project (title, type, status, tags, deadline…)
    │   ├── serializers.py
    │   ├── views.py                   ← List/Create/Retrieve/Update/Delete + mine/
    │   └── urls.py
    │
    ├── applications/                  ← Student applications
    │   ├── models.py                  ← Application (student→project, status, cover letter)
    │   ├── serializers.py
    │   ├── views.py                   ← Apply, MyApps, ProjectApps, UpdateStatus, Withdraw
    │   └── urls.py
    │
    ├── messaging/                     ← Real-time chat
    │   ├── models.py                  ← Conversation (M2M participants), Message
    │   ├── serializers.py
    │   ├── views.py                   ← ConversationList, StartConversation, Messages
    │   ├── consumers.py               ← Async WebSocket ChatConsumer (JWT auth)
    │   ├── routing.py                 ← WebSocket URL routing
    │   └── urls.py
    │
    └── core/                          ← Shared utilities (empty in MVP)
        └── models.py
```

---

## Prerequisites - Install These First

| Tool | Min Version | How to Install |
|------|-------------|---------------|
| Python | 3.11+ | https://python.org/downloads |
| pip | 23+ | Comes with Python |
| PostgreSQL | 14+ | https://postgresql.org/download |
| Redis | 7+ | https://redis.io/download |
| Git | any | https://git-scm.com |

---

## STEP 1 - Get the Project Files

```bash
# Option A: unzip the downloaded file
unzip student_sponsor_platform.zip
cd student_sponsor_platform
cd backend

# Option B: if using git
git clone <your-repo-url> student_sponsor_platform
cd student_sponsor_platform
cd backend
```

Confirm the structure:
```bash
ls -la
# Should show: manage.py, requirements.txt, ssp_project/, apps/, .env.example
```

---

## STEP 2 - Create a Python Virtual Environment

```bash
# Create the venv (do this once)
python -m venv venv

# Activate — macOS/Linux:
source venv/bin/activate

# Activate — Windows (Command Prompt):
venv\Scripts\activate.bat

# Activate — Windows (PowerShell):
venv\Scripts\Activate.ps1
```

Your prompt should now show `(venv)` at the start.

**Every time you open a new terminal you must re-activate the venv.**

---

## STEP 3 - Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- Django 4.2 + DRF 3.14
- djangorestframework-simplejwt (JWT authentication)
- channels + channels-redis + daphne (WebSockets)
- psycopg2-binary (PostgreSQL driver)
- python-decouple (environment variables)
- Pillow (image uploads)
- whitenoise (static files)
- gunicorn (production HTTP server)

Expected: `Successfully installed X packages`

---

## STEP 4 - Set Up PostgreSQL

### macOS (Homebrew)
```bash
brew install postgresql@14
brew services start postgresql@14
psql postgres
```

### Ubuntu / Debian
```bash
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres psql
```

### Windows
1. Download installer from https://www.postgresql.org/download/windows/
2. Run installer, set a password for the `postgres` user
3. Open pgAdmin or psql from Start menu

### Create database and user (run inside `psql`)
```sql
-- Create a dedicated database
CREATE DATABASE ssp_db;

-- Create a dedicated user with a strong password
CREATE USER ssp_user WITH PASSWORD 'password';

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE ssp_db TO ssp_user;

-- Required for Django migrations in PostgreSQL 15+
ALTER DATABASE ssp_db OWNER TO ssp_user;

-- Exit psql
\q
```

**Test the connection:**
```bash
psql -U ssp_user -d ssp_db -h localhost
# Should connect without errors
\q
```

---

## STEP 5 — Set Up Redis

Redis is required for Django Channels (WebSocket message routing).

### macOS (Homebrew)
```bash
brew install redis
brew services start redis
redis-cli ping   # Should return: PONG
```

### Windows
```bash
# Inside WSL2 Ubuntu terminal:
sudo apt install redis-server
sudo service redis-server start
redis-cli ping
```

---

## STEP 6 - Configure Environment Variables

```bash
# Copy the template
cp .env.example .env

# Open .env in your editor
nano .env         # or: code .env / vim .env / notepad .env
```

Fill in your values:
```env
# Generate a strong key:
# python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
SECRET_KEY=your-generated-secret-key-here

DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Match what you created in Step 4
DB_NAME=ssp_db
DB_USER=ssp_user
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# Redis from Step 5
REDIS_URL=redis://localhost:6379

# React frontend URL (used for CORS)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**Generate a SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## STEP 7 - Run Database Migrations

This creates all the database tables.

```bash
# Generate migration files from models
python manage.py makemigrations users
python manage.py makemigrations projects
python manage.py makemigrations applications
python manage.py makemigrations messaging

# Apply all migrations to PostgreSQL
python manage.py migrate
```

Expected output ends with:
```
Applying users.0001_initial... OK
Applying projects.0001_initial... OK
Applying applications.0001_initial... OK
Applying messaging.0001_initial... OK
```

**Verify tables were created:**
```bash
psql -U ssp_user -d ssp_db -c "\dt"
# Should list: users, student_profiles, sponsor_profiles, faculty_profiles,
#              projects, applications, conversations, messages, ...
```

---

## STEP 8 - Create a Superuser (Admin Account)

```bash
python manage.py createsuperuser
```

You will be prompted:
```
Email: admin@ssp.com
First name: Admin
Last name: User
Password: (min 8 chars, not too common)
Password (again):
Superuser created successfully.
```

This user gets `role=admin` automatically and has access to both the Django admin panel and the SSP admin dashboard.

---

## STEP 9 — Collect Static Files (Optional in Dev)

```bash
python manage.py collectstatic --noinput
# Only needed if you want to test whitenoise in dev,
# or when deploying to production.
```

---

## STEP 10 — Start the Server

### Option A — Daphne (RECOMMENDED — supports HTTP + WebSocket)
```bash
daphne -b 0.0.0.0 -p 8000 ssp_project.asgi:application
```

Expected output:
```
2024-01-01 12:00:00,000 INFO     Starting server at tcp:0.0.0.0:8000
2024-01-01 12:00:00,001 INFO     HTTP/WebSocket server running
```

### Option B — Django runserver (HTTP only — no WebSocket/chat)
```bash
python manage.py runserver 0.0.0.0:8000
```

> ⚠️  `runserver` does NOT support WebSockets. Messaging page will not work in real-time.
> Always use `daphne` for full functionality.

---

## STEP 11 — Verify the Backend is Working

### Check the server is responding:
```bash
curl http://localhost:8000/api/v1/projects/
# Expected: {"count":0,"next":null,"previous":null,"results":[]}
```

### Test user registration:
```bash
curl -X POST http://localhost:8000/api/v1/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "student",
    "password": "Test1234!",
    "password2": "Test1234!"
  }'
# Expected: {"message":"Account created successfully.","user":{...}}
```

### Test login and get JWT:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"Test1234!"}'
# Expected: {"access":"eyJ...","refresh":"eyJ..."}
```

### Test authenticated request:
```bash
# Save the token from the login response:
TOKEN="paste-your-access-token-here"

curl http://localhost:8000/api/v1/users/me/ \
  -H "Authorization: Bearer $TOKEN"
# Expected: {"id":1,"email":"student@test.com","role":"student",...}
```

### Access Django Admin Panel:
Open http://localhost:8000/admin/ — login with your superuser credentials.

---

## STEP 12 — Complete API Reference

### Authentication

| Method | Endpoint | Auth | Body / Notes |
|--------|----------|------|------|
| POST | /api/v1/users/register/ | None | email, first_name, last_name, role, password, password2 |
| POST | /api/v1/auth/login/ | None | email, password → returns access + refresh tokens |
| POST | /api/v1/auth/refresh/ | None | refresh → returns new access token |
| POST | /api/v1/auth/logout/ | Bearer | refresh → blacklists token |
| GET  | /api/v1/users/me/ | Bearer | Returns current user |
| PATCH | /api/v1/users/me/ | Bearer | Update first_name, last_name |
| POST | /api/v1/users/change-password/ | Bearer | old_password, new_password |

### Profiles

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET/PATCH | /api/v1/users/profile/student/ | Bearer (student) | Own student profile |
| GET/PATCH | /api/v1/users/profile/sponsor/ | Bearer (sponsor) | Own sponsor profile |
| GET/PATCH | /api/v1/users/profile/faculty/ | Bearer (faculty) | Own faculty profile |
| GET | /api/v1/users/students/{id}/ | Bearer | Public student profile view |

### Projects

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | /api/v1/projects/ | Bearer | List projects. ?search= ?status= ?project_type= ?is_paid= ?tags= |
| POST | /api/v1/projects/ | Bearer (sponsor/faculty) | Create project |
| GET | /api/v1/projects/{id}/ | Bearer | Project detail |
| PATCH | /api/v1/projects/{id}/ | Bearer (owner/admin) | Update project |
| DELETE | /api/v1/projects/{id}/ | Bearer (owner/admin) | Delete project |
| GET | /api/v1/projects/mine/ | Bearer | Projects created by current user |

### Applications

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | /api/v1/applications/ | Bearer (student) | Apply. Body: project_id, cover_letter |
| GET | /api/v1/applications/mine/ | Bearer (student) | Student's own applications |
| GET | /api/v1/applications/project/{id}/ | Bearer (sponsor/faculty) | Applicants for a project |
| PATCH | /api/v1/applications/{id}/status/ | Bearer (sponsor/faculty) | Update status + notes |
| DELETE | /api/v1/applications/{id}/withdraw/ | Bearer (student) | Withdraw application |

### Messaging (REST)

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | /api/v1/messages/conversations/ | Bearer | All conversations for current user |
| POST | /api/v1/messages/start/ | Bearer | Start conversation. Body: recipient_id, message |
| GET | /api/v1/messages/conversations/{id}/messages/ | Bearer | Message history (marks as read) |
| POST | /api/v1/messages/conversations/{id}/send/ | Bearer | Send message (REST fallback) |

### Messaging (WebSocket)
```
URL:    ws://localhost:8000/ws/chat/{conversation_id}/?token=<access_token>
Send:   { "message": "Hello!" }
Receive:{ "type": "message", "message_id": 1, "content": "Hello!",
          "sender_id": 2, "sender_name": "Jane Smith", "created_at": "..." }
Errors: Code 4001 = Unauthorized, Code 4003 = Not a participant
```

### Admin

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | /api/v1/users/admin/users/ | Bearer (admin) | All users. ?role=student |
| GET/PATCH/DELETE | /api/v1/users/admin/users/{id}/ | Bearer (admin) | Manage user |

---

## STEP 13 - End-to-End Test Flow

### Test 1 — Register all roles
```bash
# Sponsor
curl -X POST http://localhost:8000/api/v1/users/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"sponsor@test.com","first_name":"Acme","last_name":"Corp","role":"sponsor","password":"Test1234!","password2":"Test1234!"}'

# Faculty
curl -X POST http://localhost:8000/api/v1/users/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"faculty@test.com","first_name":"Prof","last_name":"Johnson","role":"faculty","password":"Test1234!","password2":"Test1234!"}'
```

### Test 2 — Sponsor creates a project
```bash
# Get sponsor token
SPONSOR_TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"sponsor@test.com","password":"Test1234!"}' | python -c "import sys,json; print(json.load(sys.stdin)['access'])")

# Create project
curl -X POST http://localhost:8000/api/v1/projects/ \
  -H "Authorization: Bearer $SPONSOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python ML Intern",
    "description": "Build ML models for our platform.",
    "project_type": "internship",
    "status": "open",
    "is_paid": true,
    "stipend": "$2000/month",
    "tags": "Python,ML,Django"
  }'
```

### Test 3 — Student applies
```bash
STUDENT_TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"Test1234!"}' | python -c "import sys,json; print(json.load(sys.stdin)['access'])")

curl -X POST http://localhost:8000/api/v1/applications/ \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"project_id": 1, "cover_letter": "I am very interested in this role."}'
```

### Test 4 — Sponsor views and accepts application
```bash
# View applicants
curl http://localhost:8000/api/v1/applications/project/1/ \
  -H "Authorization: Bearer $SPONSOR_TOKEN"

# Accept application (id=1)
curl -X PATCH http://localhost:8000/api/v1/applications/1/status/ \
  -H "Authorization: Bearer $SPONSOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted", "sponsor_notes": "Great fit!"}'
```

### Test 5 — Start a conversation
```bash
curl -X POST http://localhost:8000/api/v1/messages/start/ \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient_id": 1, "message": "Hi! I applied to your project."}'
```

---

## STEP 14 - Troubleshooting

### "could not connect to server: Connection refused" (PostgreSQL)
```bash
# macOS:
brew services start postgresql@15
# Linux:
sudo systemctl start postgresql
# Check status:
sudo systemctl status postgresql
```

### "Error 111 connecting to localhost:6379" (Redis)
```bash
# macOS:
brew services start redis
# Linux:
sudo systemctl start redis-server
# Test:
redis-cli ping   # Must return PONG
```

### "ModuleNotFoundError: No module named 'channels'"
```bash
# Your virtualenv is not activated
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

### "django.db.utils.OperationalError: FATAL: password authentication failed"
- Double-check DB_USER and DB_PASSWORD in your `.env` file
- Test connection: `psql -U ssp_user -d ssp_db -h localhost`

### "relation does not exist" after migrate
```bash
# Re-run migrations in order
python manage.py migrate users
python manage.py migrate projects
python manage.py migrate applications
python manage.py migrate messaging
python manage.py migrate
```

### WebSocket closes immediately (code 4001)
- Token in query string is missing or expired
- Frontend must pass `?token=<valid_jwt>` in the WS URL
- Get a fresh token: `POST /api/v1/auth/login/`

### "CORS policy" errors in browser
- `CORS_ALLOWED_ORIGINS` in `.env` must include the exact frontend URL
- Example: `CORS_ALLOWED_ORIGINS=http://localhost:5173`
- Restart `daphne` after changing `.env`

### Migrations conflict / "table already exists"
```bash
python manage.py migrate --fake-initial
# Or for a clean slate in development:
psql -U ssp_user -d ssp_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
python manage.py migrate
```

---

## STEP 15 — Production Deployment

### Environment changes for production
```env
DEBUG=False
SECRET_KEY=<strong-50-char-random-string>
ALLOWED_HOSTS=api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
DB_HOST=<rds-endpoint-or-db-host>
REDIS_URL=redis://<elasticache-or-redis-host>:6379
```
###Deploy to public cloud
---

## Database Schema Summary

```sql
-- users (custom user model)
users: id, email, first_name, last_name, role, is_active, is_staff, is_verified, date_joined

-- role-specific profiles
student_profiles: id, user_id, bio, university, major, gpa, skills, resume, portfolio_url, linkedin_url, github_url, avatar
sponsor_profiles: id, user_id, company_name, industry, website, description, logo
faculty_profiles: id, user_id, department, university, bio, research_interests

-- projects
projects: id, created_by_id, title, description, requirements, project_type, status,
          is_paid, stipend, tags, max_applicants, deadline, created_at, updated_at

-- applications (unique: student_id + project_id)
applications: id, student_id, project_id, cover_letter, resume, status,
              sponsor_notes, applied_at, updated_at

-- messaging
conversations: id, created_at, updated_at
               [M2M: conversations_participants → users]
messages: id, conversation_id, sender_id, content, is_read, created_at
```

---

## Role Permission Matrix

| Action | student | sponsor | faculty | admin |
|--------|---------|---------|---------|-------|
| Register / Login | ✅ | ✅ | ✅ | ✅ |
| View open projects | ✅ | ✅ | ✅ | ✅ |
| Create projects | ❌ | ✅ | ✅ | ✅ |
| Edit/delete own projects | ❌ | ✅ | ✅ | ✅ |
| Apply to projects | ✅ | ❌ | ❌ | ❌ |
| View own applications | ✅ | ❌ | ❌ | ✅ |
| View project applicants | ❌ | ✅ (own) | ✅ (own) | ✅ |
| Update application status | ❌ | ✅ | ✅ | ✅ |
| Messaging | ✅ | ✅ | ✅ | ✅ |
| Admin: manage all users | ❌ | ❌ | ❌ | ✅ |
| Admin: view all data | ❌ | ❌ | ❌ | ✅ |

---

## Quick Reference — Common Commands

```bash
# Activate virtualenv
source venv/bin/activate

# Start server (full features)
daphne -b 0.0.0.0 -p 8000 ssp_project.asgi:application

# Start server (HTTP only, no chat)
python manage.py runserver

# Create migrations
python manage.py makemigrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Django shell (interactive Python with models loaded)
python manage.py shell

# Check for configuration errors
python manage.py check

# Collect static files (production)
python manage.py collectstatic --noinput

# Run tests
python manage.py test apps/
```
