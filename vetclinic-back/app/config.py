import os
from datetime import timedelta
from dotenv import load_dotenv

# Явно загружаем .env, если он лежит в корне бэкенда
load_dotenv()

class Config:
    # Берем DATABASE_URL из окружения, если его нет — падает дефолт для локалки (без докера)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'postgresql://postgres:postgres@localhost:5432/hvosstorg'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY', 'supersecretkey')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'super-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)