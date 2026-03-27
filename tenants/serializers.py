from rest_framework import serializers
from .models import Membership


class MembershipSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='tenant.id')
    name = serializers.CharField(source='tenant.name')

    class Meta:
        model = Membership
        fields = ['id', 'name', 'role']