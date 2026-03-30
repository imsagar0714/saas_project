from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Project
from .serializers import ProjectSerializer
from tenants.mixins import TenantAccessMixin


class ProjectListCreateView(TenantAccessMixin, APIView):
    permission_classes = [IsAuthenticated]

    # 🔹 GET → all members can view
    def get(self, request):
        tenant, membership, error = self.get_active_membership(request)
        if error:
            return error

        projects = Project.objects.filter(tenant=tenant).order_by("-created_at")
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    # 🔹 POST → admin only
    def post(self, request):
        tenant, membership, error = self.get_active_membership(request)
        if error:
            return error

        if membership.role != "admin":
            return Response(
                {"detail": "Only admins can create projects."},
                status=403
            )

        name = request.data.get("name")
        description = request.data.get("description", "")

        if not name:
            return Response(
                {"detail": "Project name is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        project = Project.objects.create(
            tenant=tenant,
            created_by=request.user,
            name=name,
            description=description
        )

        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProjectDetailView(TenantAccessMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get_project(self, request, project_id):
        tenant, membership, error = self.get_active_membership(request)
        if error:
            return None, None, error

        try:
            project = Project.objects.get(id=project_id, tenant=tenant)
        except Project.DoesNotExist:
            return None, None, Response(
                {"detail": "Project not found in this workspace."},
                status=404
            )

        return project, membership, None

    # 🔹 GET single project → all members
    def get(self, request, project_id):
        project, membership, error = self.get_project(request, project_id)
        if error:
            return error

        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    # 🔹 PUT update project → admin only
    def put(self, request, project_id):
        project, membership, error = self.get_project(request, project_id)
        if error:
            return error

        if membership.role != "admin":
            return Response(
                {"detail": "Only admins can update projects."},
                status=403
            )

        name = request.data.get("name", project.name)
        description = request.data.get("description", project.description)

        if not name:
            return Response(
                {"detail": "Project name cannot be empty."},
                status=400
            )

        project.name = name
        project.description = description
        project.save()

        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    # 🔹 DELETE project → admin only
    def delete(self, request, project_id):
        project, membership, error = self.get_project(request, project_id)
        if error:
            return error

        if membership.role != "admin":
            return Response(
                {"detail": "Only admins can delete projects."},
                status=403
            )

        project.delete()
        return Response(
            {"detail": "Project deleted successfully."},
            status=200
        )