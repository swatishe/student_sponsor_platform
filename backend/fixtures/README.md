# Fixtures

Use Django management commands to load/dump data:

## Create a superuser
```bash
python manage.py createsuperuser
```

## Dump current data
```bash
python manage.py dumpdata --indent 2 > fixtures/initial_data.json
```

## Load fixture data
```bash
python manage.py loaddata fixtures/initial_data.json
```
