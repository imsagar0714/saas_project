from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Membership
from .serializers import MembershipSerializer


class MyWorkspacesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        memberships = Membership.objects.filter(user=request.user).select_related('tenant')
        serializer = MembershipSerializer(memberships, many=True)
        return Response(serializer.data)