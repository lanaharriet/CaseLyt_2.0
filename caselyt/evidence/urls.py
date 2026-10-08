from django.urls import path
from .views import (
    EvidenceListView, ClaimListView, FindingListView,
    EvidenceGraphView, CaseDNAView
)

urlpatterns = [
    path('', EvidenceListView.as_view(), name='evidence-list'),
    path('claims/', ClaimListView.as_view(), name='claim-list'),
    path('findings/', FindingListView.as_view(), name='finding-list'),
    path('graph/', EvidenceGraphView.as_view(), name='evidence-graph'),
    path('dna/', CaseDNAView.as_view(), name='case-dna'),
]
