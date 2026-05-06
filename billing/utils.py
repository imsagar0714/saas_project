from django.utils import timezone
from .models import WorkspaceSubscription, Plan


def downgrade_expired_subscriptions():
    now = timezone.now()

    expired_subs = WorkspaceSubscription.objects.filter(
        status="active",
        current_period_end__lt=now
    )

    free_plan = Plan.objects.get(name__iexact="Free")

    for sub in expired_subs:
        sub.plan = free_plan
        sub.status = "canceled"
        sub.provider_subscription_id = None
        sub.save()

        print(f"⬇️ Downgraded {sub.tenant.name} to Free plan")