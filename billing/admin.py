from django.contrib import admin
from .models import Plan, WorkspaceSubscription


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "price_monthly", "price_yearly", "max_members", "max_projects", "can_invite")


@admin.register(WorkspaceSubscription)
class WorkspaceSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("id", "tenant", "plan", "status", "billing_cycle", "current_period_end")