from django.urls import path
from .views import (
    CurrentBillingView,
    PlanListView,
    CreateSubscriptionView,
    RazorpayWebhookView,
    VerifyPaymentView,   
)

urlpatterns = [
    path("current/", CurrentBillingView.as_view()),
    path("plans/", PlanListView.as_view()),
    path("subscribe/", CreateSubscriptionView.as_view()),
    path("verify/", VerifyPaymentView.as_view()),   
    path("webhook/", RazorpayWebhookView.as_view()),
]