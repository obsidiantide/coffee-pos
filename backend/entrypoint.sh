#!/bin/bash

echo "Running migrations..."
python manage.py migrate --noinput

echo "Starting Gunicorn..."
exec gunicorn coffee_pos.wsgi:application --bind 0.0.0.0:${PORT:-8000} --log-file -
