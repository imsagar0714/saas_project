from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source="tenant.name", read_only=True)
    created_by_email = serializers.CharField(source="created_by.email", read_only=True)

    class Meta:
        model = Project
        fields = ["id", "name", "description", "tenant_name", "created_by_email", "created_at"]