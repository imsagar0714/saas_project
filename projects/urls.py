from django.urls import path
from .views import ProjectListCreateView, ProjectDetailView

urlpatterns = [
    path("projects/", ProjectListCreateView.as_view(), name="projects"),
    path("projects/<int:project_id>/", ProjectDetailView.as_view(), name="project-detail"),
]