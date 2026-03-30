from django.http import JsonResponse
from .models import Tenant, Membership


class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.tenant_id = request.headers.get("X-Tenant-ID")
        return self.get_response(request)