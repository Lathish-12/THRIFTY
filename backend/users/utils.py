from django.core.mail import send_mail
from django.conf import settings
from .models import Notification

def send_instant_notification(user, subject, message):
    """
    Sends an email notification and creates an in-app notification.
    """
    try:
        # 1. Create In-app Notification
        Notification.objects.create(
            user=user,
            title=subject,
            message=message
        )

        # 2. Send Email if user has notifications enabled
        if user.profile.notifications_enabled:
            send_mail(
                subject=f"Thrifty Notification: {subject}",
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False
            )
    except Exception as e:
        print(f"Error sending notification to {user.email}: {e}")
