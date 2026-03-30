from rest_framework.response import Response
from .models import Tenant, Membership


class TenantAccessMixin:
    def get_active_membership(self, request):
        tenant_id = request.tenant_id

        if not tenant_id:
            return None, None, Response(
                {"detail": "No active workspace selected."},
                status=400
            )

        try:
            tenant = Tenant.objects.get(id=int(tenant_id))
        except Tenant.DoesNotExist:
            return None, None, Response(
                {"detail": "Workspace not found."},
                status=404
            )

        try:
            membership = Membership.objects.get(
                user=request.user,
                tenant=tenant
            )
        except Membership.DoesNotExist:
            return None, None, Response(
                {"detail": "You do not belong to this workspace."},
                status=403
            )

        return tenant, membership, None