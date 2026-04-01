from django.db import models
from django.conf import settings
import uuid


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

    class Meta:
        unique_together = ("tenant", "email")

    def __str__(self):
        return f"{self.email} invited to {self.tenant.name} as {self.role}"

class Plan(models.Model):
    name = models.CharField(max_length=50, unique=True)
    # Pricing (we will connect to Stripe later)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_yearly = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # Limits
    max_members = models.IntegerField(default=1)
    max_projects = models.IntegerField(default=1)

    # Feature flags (simple version for now)
    can_invite = models.BooleanField(default=False)
    has_priority_support = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name  
    
class WorkspaceSubscription(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("trialing", "Trialing"),
        ("past_due", "Past Due"),
        ("canceled", "Canceled"),
    ]

    tenant = models.OneToOneField(
        "Tenant",
        on_delete=models.CASCADE,
        related_name="subscription"
    )

    plan = models.ForeignKey(
        Plan,
        on_delete=models.SET_NULL,
        null=True,
        related_name="subscriptions"
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")

    # Billing cycle
    billing_cycle = models.CharField(max_length=10, choices=[("monthly", "Monthly"), ("yearly", "Yearly")], default="monthly")

    # Dates
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)

    # Stripe fields (VERY IMPORTANT for future)
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tenant.name} - {self.plan.name if self.plan else 'No Plan'}"