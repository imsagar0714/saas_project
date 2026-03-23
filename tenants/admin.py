from django.contrib import admin
from .models import Tenant, Membership

admin.site.register(Tenant)
admin.site.register(Membership)