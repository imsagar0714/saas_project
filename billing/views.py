import razorpay
from django.conf import settings
import json
import hmac
import hashlib
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from .models import Plan, WorkspaceSubscription
from .serializers import PlanSerializer, WorkspaceSubscriptionSerializer
from tenants.mixins import TenantAccessMixin
from django.utils.decorators import method_decorator


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
        try:
            tenant, membership, error = self.get_active_membership(request)
            if error:
                return error

            if membership.role != "admin":
                return Response({"detail": "Only admins can upgrade"}, status=403)

            plan_id = request.data.get("plan_id")
            billing_cycle = request.data.get("billing_cycle", "monthly")

            # ✅ Safe plan fetch
            try:
                plan = Plan.objects.get(id=plan_id)
            except Plan.DoesNotExist:
                return Response({"detail": "Invalid plan"}, status=404)

            if plan.name.lower() == "free":
                return Response({"detail": "Free plan doesn't need payment"}, status=400)

            subscription = tenant.subscription

            # ✅ Razorpay plan mapping
            razorpay_plan_id = (
                plan.razorpay_plan_id_monthly
                if billing_cycle == "monthly"
                else plan.razorpay_plan_id_yearly
            )

            if not razorpay_plan_id:
                return Response({"detail": "Razorpay plan ID missing"}, status=400)

            # ✅ Create Razorpay subscription
            razorpay_sub = client.subscription.create({
                "plan_id": razorpay_plan_id,
                "customer_notify": 1,
                "total_count": 12,
            })

            # ✅ Save locally
            subscription.payment_provider = "razorpay"
            subscription.provider_subscription_id = razorpay_sub["id"]
            subscription.billing_cycle = billing_cycle
            subscription.status = razorpay_sub["status"]  # important
            subscription.save()

            return Response({
                "subscription_id": razorpay_sub["id"],
                "status": razorpay_sub["status"],
                "razorpay_key": settings.RAZORPAY_KEY_ID  # 🔥 needed for frontend
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)

class VerifyPaymentView(TenantAccessMixin, APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tenant, membership, error = self.get_active_membership(request)
        if error:
            return error

        # 🔥 IMPORTANT:
        # We are trusting webhook instead of frontend signature verification

        subscription = tenant.subscription
        subscription.status = "active"
        subscription.save()

        return Response({
            "detail": "Payment verified (handled by webhook)"
        })
        
@method_decorator(csrf_exempt, name='dispatch')
class RazorpayWebhookView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        try:
            body = request.body
            received_signature = request.headers.get("X-Razorpay-Signature")

            # 🔥 Secure signature verification
            generated_signature = hmac.new(
                bytes(settings.RAZORPAY_WEBHOOK_SECRET, 'utf-8'),
                body,
                hashlib.sha256
            ).hexdigest()

            if not hmac.compare_digest(generated_signature, received_signature):
                return Response({"error": "Invalid signature"}, status=400)

            data = json.loads(body)
            event = data.get("event")

            print("🔥 WEBHOOK EVENT:", event)

            if event == "subscription.activated":
                subscription_id = data["payload"]["subscription"]["entity"]["id"]

                try:
                    sub = WorkspaceSubscription.objects.get(
                        provider_subscription_id=subscription_id
                    )
                    sub.status = "active"
                    sub.save()
                    print("✅ Subscription activated")

                except WorkspaceSubscription.DoesNotExist:
                    print("❌ Subscription not found")

            elif event == "subscription.charged":
                print("💰 Recurring payment success")

            elif event == "payment.captured":
                print("💵 Payment captured")
                
            print("🔥 WEBHOOK EVENT:", event)

            return Response({"status": "success"})

        except Exception as e:
            print("❌ Webhook error:", str(e))
            return Response({"error": str(e)}, status=500)