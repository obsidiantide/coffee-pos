FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/backend/requirements.txt

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

COPY . /app/.

WORKDIR /app/backend

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "coffee_pos.wsgi:application", "--bind", "0.0.0.0:8000"]
