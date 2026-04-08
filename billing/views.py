import razorpay
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Plan, WorkspaceSubscription
from .serializers import PlanSerializer, WorkspaceSubscriptionSerializer
from tenants.mixins import TenantAccessMixin


client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class CurrentBillingView(TenantAccessMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant, membership, error = self.get_active_membership(request)
        if error:
            return error

        subscription = getattr(tenant, "subscription", None)

        if not subscription:
            return Response({"detail": "No subscription found"}, status=404)

        return Response(WorkspaceSubscriptionSerializer(subscription).data)


class PlanListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        plans = Plan.objects.all().order_by("price_monthly")
        return Response(PlanSerializer(plans, many=True).data)


class CreateSubscriptionView(TenantAccessMixin, APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tenant, membership, error = self.get_active_membership(request)
        if error:
            return error

        if membership.role != "admin":
            return Response({"detail": "Only admins can upgrade"}, status=403)

        plan_id = request.data.get("plan_id")
        billing_cycle = request.data.get("billing_cycle", "monthly")

        plan = Plan.objects.get(id=plan_id)

        if plan.name.lower() == "free":
            return Response({"detail": "Free plan doesn't need payment"}, status=400)

        subscription = tenant.subscription

        # choose Razorpay plan
        razorpay_plan_id = (
            plan.razorpay_plan_id_monthly
            if billing_cycle == "monthly"
            else plan.razorpay_plan_id_yearly
        )

        if not razorpay_plan_id:
            return Response({"detail": "Razorpay plan ID missing"}, status=400)

        # create Razorpay subscription
        razorpay_sub = client.subscription.create({
            "plan_id": razorpay_plan_id,
            "customer_notify": 1,
            "total_count": 12,
        })

        # save locally
        subscription.payment_provider = "razorpay"
        subscription.provider_subscription_id = razorpay_sub["id"]
        subscription.billing_cycle = billing_cycle
        subscription.save()

        return Response({
            "subscription_id": razorpay_sub["id"],
            "status": razorpay_sub["status"]
        })