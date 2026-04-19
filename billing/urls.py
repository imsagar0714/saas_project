from django.urls import path
from .views import (
    CurrentBillingView,
    PlanListView,
    CreateSubscriptionView,
    razorpay_webhook,   # ✅ ADD THIS
)

urlpatterns = [
    path("current/", CurrentBillingView.as_view()),
    path("plans/", PlanListView.as_view()),
    path("subscribe/", CreateSubscriptionView.as_view()),

    # 🔥 ADD THIS
    path("payment/webhook/", razorpay_webhook),
]