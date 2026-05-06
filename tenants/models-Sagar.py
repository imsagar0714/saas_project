from django.db import models
from django.conf import settings
import uuid
from django.utils import timezone
from datetime import timedelta


class Tenant(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Membership(models.Model):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("member", "Member"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="memberships"
    )
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name="memberships"
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="member")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "tenant")

    def __str__(self):
        return f"{self.user.email} - {self.tenant.name} ({self.role})"
    
class Invitation(models.Model):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("member", "Member"),
    ]

    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name="invitations"
    )
    email = models.EmailField()
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="member")

    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_invitations"
    )

    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    is_accepted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()  # 🔥 NEW

    class Meta:
        unique_together = ("tenant", "email")

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=2)  # 48 hours
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_accepted and self.expires_at > timezone.now()

    def __str__(self):
        return f"{self.email} invited to {self.tenant.name}"
