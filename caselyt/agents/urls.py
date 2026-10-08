from django.urls import path
from .views import AgentActivityListView, VerifyClaimAPIView

urlpatterns = [
    path('activity/', AgentActivityListView.as_view(), name='agent-activity'),
    path('verify/', VerifyClaimAPIView.as_view(), name='agent-verify'),
]
