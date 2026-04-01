from rest_framework import serializers
from .models import Membership,Invitation,Plan,WorkspaceSubscription
from accounts.models import User


class MembershipSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.name", read_only=True)

    class Meta:
        model = Membership
        fields = ["id", "user_id", "user_email", "user_name", "role", "joined_at"]


class AddMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=["admin", "member"])

class InvitationSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source="tenant.name", read_only=True)
    invited_by_email = serializers.EmailField(source="invited_by.email", read_only=True)

    class Meta:
        model = Invitation
        fields = [
            "id",
            "tenant",
            "tenant_name",
            "email",
            "role",
            "invited_by_email",
            "token",
            "is_accepted",
            "created_at",
        ]


class CreateInvitationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=["admin", "member"])
    
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
            "stripe_customer_id",
            "stripe_subscription_id",
            "plan",
        ]