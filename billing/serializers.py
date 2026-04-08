from rest_framework import serializers
from .models import Plan, WorkspaceSubscription


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = [
            "id",
            "name",
            "price_monthly",
            "price_yearly",
            "max_members",
            "max_projects",
            "can_invite",
            "has_priority_support",
        ]


class WorkspaceSubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    tenant_name = serializers.CharField(source="tenant.name", read_only=True)

    class Meta:
        model = WorkspaceSubscription
        fields = [
            "id",
            "tenant_name",
            "status",
            "billing_cycle",
            "current_period_start",
            "current_period_end",
            "payment_provider",
            "provider_customer_id",
            "provider_subscription_id",
            "plan",
        ]