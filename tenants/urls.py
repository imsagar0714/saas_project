from django.urls import path
from .views import MyWorkspacesView

urlpatterns = [
    path("my-workspaces/", MyWorkspacesView.as_view(), name="my-workspaces"),
]