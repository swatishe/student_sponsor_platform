#!/usr/bin/env bash
set -o errexit    # exit on any error

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate