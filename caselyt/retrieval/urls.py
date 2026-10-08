from django.urls import path
from .views import EvidenceSearchView

urlpatterns = [
    path('search/', EvidenceSearchView.as_view(), name='retrieval-search'),
]
