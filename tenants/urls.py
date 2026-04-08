from django.urls import path
from .views import (
    MyWorkspacesView,
    CurrentWorkspaceView,
    MemberListCreateView,
    MemberDetailView,
    InvitationListCreateView,
    InvitationAcceptView,
    InvitationDeleteView,
)

urlpatterns = [
    path("my-workspaces/", MyWorkspacesView.as_view(), name="my-workspaces"),
    path("current-workspace/", CurrentWorkspaceView.as_view(), name="current-workspace"),

    path("members/", MemberListCreateView.as_view(), name="members"),
    path("members/<int:membership_id>/", MemberDetailView.as_view(), name="member-detail"),

    path("invitations/", InvitationListCreateView.as_view(), name="invitations"),
    path("invitations/<int:invitation_id>/accept/", InvitationAcceptView.as_view(), name="accept-invitation"),
    path("invitations/<int:invitation_id>/", InvitationDeleteView.as_view(), name="delete-invitation"),

]