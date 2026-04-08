from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Tenant
from billing.models import Plan, WorkspaceSubscription


@receiver(post_save, sender=Tenant)
def create_default_subscription(sender, instance, created, **kwargs):
    if created:
        free_plan = Plan.objects.filter(name="Free").first()

        if free_plan:
            WorkspaceSubscription.objects.create(
                tenant=instance,
                plan=free_plan,
                status="active",
                billing_cycle="monthly"
            )