from django.core.mail import send_mail
from django.conf import settings


def send_invitation_email(email, token, tenant_name):
    invite_link = f"{settings.FRONTEND_URL}/accept-invite/{token}"

    subject = f"Invitation to join {tenant_name}"
    message = f"""
You have been invited to join {tenant_name}.

Click here to join:
{invite_link}

This link expires in 48 hours.
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )