from rest_framework.response import Response
from rest_framework import status


class PlanLimitMixin:
    def check_subscription(self, tenant):
        subscription = getattr(tenant, "subscription", None)

        if not subscription or subscription.status != "active":
            return Response(
                {"detail": "No active subscription"},
                status=status.HTTP_403_FORBIDDEN
            )

        return None

    def check_project_limit(self, tenant):
        subscription = tenant.subscription
        plan = subscription.plan

        if tenant.projects.count() >= plan.max_projects:
            return Response(
                {"detail": "Project limit reached for your plan"},
                status=status.HTTP_403_FORBIDDEN
            )

        return None

    def check_member_limit(self, tenant):
        subscription = tenant.subscription
        plan = subscription.plan

        if tenant.memberships.count() >= plan.max_members:
            return Response(
                {"detail": "Member limit reached for your plan"},
                status=status.HTTP_403_FORBIDDEN
            )

        return None