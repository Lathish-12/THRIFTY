#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrifty_backend.settings')
    
    # DEBUG: Check for .env loading
    try:
        from decouple import config
        key = config('GEMINI_API_KEY', default=None)
        print(f"MANAGE.PY DEBUG: GEMINI_API_KEY found: {key[:5] + '...' if key else 'None'}")
        print(f"MANAGE.PY DEBUG: CWD: {os.getcwd()}")
    except Exception as e:
        print(f"MANAGE.PY DEBUG: Error checking config: {e}")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
