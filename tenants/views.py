from .models import Membership,Tenant
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from accounts.models import User
from .serializers import MembershipSerializer, AddMemberSerializer
from .mixins import TenantAccessMixin


class MyWorkspacesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        memberships = Membership.objects.filter(user=request.user).select_related('tenant')
        serializer = MembershipSerializer(memberships, many=True)
        return Response(serializer.data)
    
class CurrentWorkspaceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant_id = request.tenant_id

        if not tenant_id:
            return Response(
                {"detail": "No active workspace selected."},
                status=400
            )

        try:
            tenant = Tenant.objects.get(id=int(tenant_id))
        except Tenant.DoesNotExist:
            return Response(
                {"detail": "Workspace not found."},
                status=404
            )

        is_member = Membership.objects.filter(
            user=request.user,
            tenant=tenant
        ).exists()

        if not is_member:
            return Response(
                {"detail": "You do not belong to this workspace."},
                status=403
            )

        return Response({
            "tenant_id": tenant.id,
            "tenant_name": tenant.name,
            "user_email": request.user.email,
        })

class MemberListCreateView(TenantAccessMixin, APIView):
    permission_classes = [IsAuthenticated]

    # 🔹 List members → all members can view
    def get(self, request):
        tenant, membership, error = self.get_active_membership(request)
        if error:
            return error

        members = Membership.objects.filter(tenant=tenant).select_related("user").order_by("-joined_at")
        serializer = MembershipSerializer(members, many=True)
        return Response(serializer.data)

    # 🔹 Add member → admin only
    def post(self, request):
        tenant, membership, error = self.get_active_membership(request)
        if error:
            return error

        if membership.role != "admin":
            return Response(
                {"detail": "Only admins can add members."},
                status=403
            )

        serializer = AddMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        role = serializer.validated_data["role"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "User with this email does not exist."},
                status=404
            )

        if Membership.objects.filter(user=user, tenant=tenant).exists():
            return Response(
                {"detail": "User is already a member of this workspace."},
                status=400
            )

        new_membership = Membership.objects.create(
            user=user,
            tenant=tenant,
            role=role
        )

        return Response(
            MembershipSerializer(new_membership).data,
            status=status.HTTP_201_CREATED
        )


class MemberDetailView(TenantAccessMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get_membership_object(self, request, membership_id):
        tenant, current_membership, error = self.get_active_membership(request)
        if error:
            return None, None, error

        try:
            target_membership = Membership.objects.select_related("user").get(
                id=membership_id,
                tenant=tenant
            )
        except Membership.DoesNotExist:
            return None, None, Response(
                {"detail": "Member not found in this workspace."},
                status=404
            )

        return target_membership, current_membership, None

    # 🔹 Update role → admin only
    def put(self, request, membership_id):
        target_membership, current_membership, error = self.get_membership_object(request, membership_id)
        if error:
            return error

        if current_membership.role != "admin":
            return Response(
                {"detail": "Only admins can update roles."},
                status=403
            )

        new_role = request.data.get("role")

        if new_role not in ["admin", "member"]:
            return Response(
                {"detail": "Role must be 'admin' or 'member'."},
                status=400
            )

        target_membership.role = new_role
        target_membership.save()

        return Response(MembershipSerializer(target_membership).data)

    # 🔹 Remove member → admin only
    def delete(self, request, membership_id):
        target_membership, current_membership, error = self.get_membership_object(request, membership_id)
        if error:
            return error

        if current_membership.role != "admin":
            return Response(
                {"detail": "Only admins can remove members."},
                status=403
            )

        # Prevent removing yourself if you are the only admin (simple safety)
        if target_membership.user == request.user and target_membership.role == "admin":
            admin_count = Membership.objects.filter(
                tenant=target_membership.tenant,
                role="admin"
            ).count()

            if admin_count == 1:
                return Response(
                    {"detail": "You cannot remove the only admin from the workspace."},
                    status=400
                )

        target_membership.delete()
        return Response(
            {"detail": "Member removed successfully."},
            status=200
        )