from django.db import models
from tenants.models import Tenant


class Plan(models.Model):
    name = models.CharField(max_length=50, unique=True)

    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_yearly = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    max_members = models.IntegerField(default=1)
    max_projects = models.IntegerField(default=1)

    can_invite = models.BooleanField(default=False)
    has_priority_support = models.BooleanField(default=False)

    # Razorpay Plan IDs
    razorpay_plan_id_monthly = models.CharField(max_length=255, blank=True, null=True)
    razorpay_plan_id_yearly = models.CharField(max_length=255, blank=True, null=True)

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

    BILLING_CYCLE_CHOICES = [
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
    ]

    tenant = models.OneToOneField(
        Tenant,
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
    billing_cycle = models.CharField(max_length=10, choices=BILLING_CYCLE_CHOICES, default="monthly")

    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)

    # 🔥 GENERIC PAYMENT FIELDS
    payment_provider = models.CharField(max_length=50, blank=True, null=True)
    provider_customer_id = models.CharField(max_length=255, blank=True, null=True)
    provider_subscription_id = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tenant.name} - {self.plan.name if self.plan else 'No Plan'}"