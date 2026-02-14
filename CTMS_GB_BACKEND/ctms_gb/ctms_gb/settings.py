from pathlib import Path
from datetime import timedelta
import os
from corsheaders.defaults import default_headers

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "replace-with-your-secret"
DEBUG = True

# ALLOWED_HOSTS = ["*", "localhost", "127.0.0.1"]
# CSRF_TRUSTED_ORIGINS = [
#     "https://*.trycloudflare.com"
# ]

INSTALLED_APPS = [
    # default apps...
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # third party
    "rest_framework",
    "corsheaders",

    # local
    "users",
    # transport
    'transport',

    # Tickets
    "passenger_tickets",
    "Payment",
    "rest_framework_simplejwt",

    # contact
    "contact",
    "about",


]
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",   # cors
    "django.middleware.security.SecurityMiddleware",
    'whitenoise.middleware.WhiteNoiseMiddleware',
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "ctms_gb.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            BASE_DIR / 'templates',  # Your existing templates (Django Admin, etc.)
            BASE_DIR / 'static',     # Add this: Path to your React index.html
        ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]
WSGI_APPLICATION = "ctms_gb.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_USER_MODEL = "users.User"

AUTH_PASSWORD_VALIDATORS = []



LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Karachi"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# CORS and cookies — adjust origins for production
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173", 
    "http://localhost:3000",
    "https://monetary-sherell-unrecondite.ngrok-free.dev",
    # " https://ton-syndrome-consumers-vintage.trycloudflare.com"
        # React dev server
]
CSRF_TRUSTED_ORIGINS = ["http://localhost:5173",'https://monetary-sherell-unrecondite.ngrok-free.dev']
SESSION_COOKIE_SAMESITE = "None"
SESSION_COOKIE_SECURE = True

CSRF_COOKIE_SAMESITE = "None"
CSRF_COOKIE_SECURE = True

CORS_ALLOW_HEADERS = [
    "content-type",
    "authorization",
    "x-requested-with",
]

# CORS_ALLOWED_ORIGIN_REGEXES = [
#     r"^https://.*\.trycloudflare\.com$",
# ]

# Ensure all necessary headers are allowed
CORS_ALLOW_HEADERS = list(default_headers) + [
    'content-type',
    'authorization',
    'x-requested-with',
    'accept',
    'origin',
    'user-agent',
    'x-csrftoken',
    'cache-control',
    'pragma',
]
# Allow common HTTP methods
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]


EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # or your SMTP server
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'iamkhan6056@gmail.com'  # Gmail address
EMAIL_HOST_PASSWORD = 'qelw cnhg ewaz pxlv'  #Gmail password
DEFAULT_FROM_EMAIL = 'iamkhan6056@gmail.com'  # Default sender email

# Contact Settings
ADMIN_EMAILS = ['iamkhan6056@gmail.com','parwanashahzaib@gmail.com','apoazizahmad@gmail.com']
SUPPORT_EMAIL = 'iamkhan6056@gmail.com'
SITE_NAME = 'PTMS Gilgit-Baltistan'

# REST Framework

SITE_URL = 'http://localhost:8000'

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.ngrok-free.app',
    '.trycloudflare.com',
    '*'
]
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static"),
]
# Required for production-like serving
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent



# This tells Django where to look for 'static' files during development
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static"),
]

# This is where files are 'collected' for production (WhiteNoise uses this)
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")



# Media files ki settings
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Ensure ngrok host is allowed
ALLOWED_HOSTS = ['*', 'monetary-sherell-unrecondite.ngrok-free.dev', 'localhost', '127.0.0.1']
