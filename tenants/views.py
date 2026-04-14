from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from accounts.models import User
from .models import Membership, Invitation , Tenant
from billing.models import Plan, WorkspaceSubscription
from .serializers import (
    MembershipSerializer,
    AddMemberSerializer,
    InvitationSerializer,
    CreateInvitationSerializer,
)
from .mixins import TenantAccessMixin


class MyWorkspacesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        memberships = Membership.objects.filter(user=request.user).select_related('tenant')
        serializer = MembershipSerializer(memberships, many=True)
        return Response(serializer.data)
    
class CreateWorkspaceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        name = request.data.get("name")

        if not name:
            return Response(
                {"detail": "Workspace name is required"},
                status=400
            )

        # 1. Create Tenant
        tenant = Tenant.objects.create(name=name)

        # 2. Create Membership
        Membership.objects.create(
            user=request.user,
            tenant=tenant,
            role="admin"
        )

        # 3. Assign Free Plan (SAFE)
        free_plan = Plan.objects.filter(name__iexact="free").first()

        if not free_plan:
            return Response(
                {"detail": "Free plan not found. Create it in admin."},
                status=400
            )

        # 4. Create Subscription
        WorkspaceSubscription.objects.create(
            tenant=tenant,
            plan=free_plan,
            status="active"
        )

        return Response(
            {
                "id": tenant.id,
                "name": tenant.name,
                "message": "Workspace created successfully"
            },
            status=status.HTTP_201_CREATED
        )

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

    # List all members in active workspace
    def get(self, request):
        tenant, membership, error = self.get_active_membership(request)
        if error:
            return error

        members = Membership.objects.filter(tenant=tenant).select_related("user").order_by("-joined_at")
        serializer = MembershipSerializer(members, many=True)
        return Response(serializer.data)

    def post(self, request):
        tenant, membership, error = self.get_active_membership(request)
        if error:
            return error

        if membership.role != "admin":
            return Response(
                {"detail": "Only admins can add members."},
                status=403
            )

        #  BILLING CHECK: Member limit
        subscription = getattr(tenant, "subscription", None)

        if not subscription or not subscription.plan:
            return Response(
                {"detail": "Workspace subscription is not configured properly."},
                status=400
            )

        current_member_count = Membership.objects.filter(tenant=tenant).count()
        max_members_allowed = subscription.plan.max_members

        if current_member_count >= max_members_allowed:
            return Response(
                {
                    "detail": f"Member limit reached for your current plan ({subscription.plan.name}). Upgrade to add more members."
                },
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

    # Update role (admin only)
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

    # Remove member (admin only)
    def delete(self, request, membership_id):
        target_membership, current_membership, error = self.get_membership_object(request, membership_id)
        if error:
            return error

        if current_membership.role != "admin":
            return Response(
                {"detail": "Only admins can remove members."},
                status=403
            )

        # Prevent removing the only admin
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
        
class InvitationListCreateView(TenantAccessMixin, APIView):
    permission_classes = [IsAuthenticated]

    # List pending invitations of active workspace
    def get(self, request):
        tenant, membership, error = self.get_active_membership(request)
        if error:
            return error

        invitations = Invitation.objects.filter(
            tenant=tenant,
            is_accepted=False
        ).order_by("-created_at")

        serializer = InvitationSerializer(invitations, many=True)
        return Response(serializer.data)

    # Create invitation (admin only)
    def post(self, request):
        tenant, membership, error = self.get_active_membership(request)
        if error:
            return error

        # 🔹 RBAC check
        if membership.role != "admin":
            return Response(
                {"detail": "Only admins can invite members."},
                status=403
            )

        # BILLING CHECK (ADD THIS HERE)
        subscription = getattr(tenant, "subscription", None)

        if not subscription or not subscription.plan:
            return Response(
                {"detail": "Workspace subscription is not configured properly."},
                status=400
            )

        if not subscription.plan.can_invite:
            return Response(
                {
                    "detail": f"Invitations are not available on your current plan ({subscription.plan.name}). Upgrade to use this feature."
                },
                status=403
            )

        # 🔹 Request validation
        serializer = CreateInvitationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        role = serializer.validated_data["role"]

        # 🔹 already member?
        existing_user = User.objects.filter(email=email).first()
        if existing_user and Membership.objects.filter(user=existing_user, tenant=tenant).exists():
            return Response(
                {"detail": "User is already a member of this workspace."},
                status=400
            )

        # 🔹 already invited?
        if Invitation.objects.filter(tenant=tenant, email=email, is_accepted=False).exists():
            return Response(
                {"detail": "This email is already invited to this workspace."},
                status=400
            )

        # 🔹 create invite
        invitation = Invitation.objects.create(
            tenant=tenant,
            email=email,
            role=role,
            invited_by=request.user
        )

        return Response(
            InvitationSerializer(invitation).data,
            status=status.HTTP_201_CREATED
        )


class InvitationAcceptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, invitation_id):
        try:
            invitation = Invitation.objects.get(id=invitation_id, is_accepted=False)
        except Invitation.DoesNotExist:
            return Response(
                {"detail": "Invitation not found or already accepted."},
                status=404
            )

        # email match check
        if request.user.email.lower() != invitation.email.lower():
            return Response(
                {"detail": "This invitation is not for your account."},
                status=403
            )

        # already member?
        if Membership.objects.filter(user=request.user, tenant=invitation.tenant).exists():
            return Response(
                {"detail": "You are already a member of this workspace."},
                status=400
            )

        Membership.objects.create(
            user=request.user,
            tenant=invitation.tenant,
            role=invitation.role
        )

        invitation.is_accepted = True
        invitation.save()

        return Response(
            {"detail": "Invitation accepted successfully."},
            status=200
        )


class InvitationDeleteView(TenantAccessMixin, APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, invitation_id):
        tenant, membership, error = self.get_active_membership(request)
        if error:
            return error

        if membership.role != "admin":
            return Response(
                {"detail": "Only admins can cancel invitations."},
                status=403
            )

        try:
            invitation = Invitation.objects.get(
                id=invitation_id,
                tenant=tenant,
                is_accepted=False
            )
        except Invitation.DoesNotExist:
            return Response(
                {"detail": "Invitation not found."},
                status=404
            )

        invitation.delete()
        return Response(
            {"detail": "Invitation cancelled successfully."},
            status=200
        )
        
