from django.urls import path
from .views import (
    MyWorkspacesView,
    CurrentWorkspaceView,
    MemberListCreateView,
    MemberDetailView,
)

urlpatterns = [
    path("my-workspaces/", MyWorkspacesView.as_view(), name="my-workspaces"),
    path("current-workspace/", CurrentWorkspaceView.as_view(), name="current-workspace"),

    path("members/", MemberListCreateView.as_view(), name="members"),
    path("members/<int:membership_id>/", MemberDetailView.as_view(), name="member-detail"),
]