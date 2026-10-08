from django.urls import path
from .views import QueryResearchWorkspaceView

urlpatterns = [
    path('query/', QueryResearchWorkspaceView.as_view(), name='research-query'),
]
