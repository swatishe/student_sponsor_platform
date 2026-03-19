#!/usr/bin/env python
"""
Django's command-line utility for administrative tasks.
Usage:
    python manage.py runserver          # HTTP only (no WebSocket)
    daphne ssp_project.asgi:application # HTTP + WebSocket (recommended)
"""
import os
import sys


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ssp_project.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Make sure it's installed and that you "
            "have activated your virtual environment."
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
