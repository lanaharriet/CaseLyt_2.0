from django.urls import path
from .views import (
    CaseListCreateView, CaseDetailView,
    DocumentListUploadView, DocumentDetailView, DocumentReprocessView
)

urlpatterns = [
    path('cases/', CaseListCreateView.as_view(), name='case-list-create'),
    path('cases/<uuid:pk>/', CaseDetailView.as_view(), name='case-detail'),
    path('documents/', DocumentListUploadView.as_view(), name='document-list-upload'),
    path('documents/<uuid:pk>/', DocumentDetailView.as_view(), name='document-detail'),
    path('documents/<uuid:pk>/reprocess/', DocumentReprocessView.as_view(), name='document-reprocess'),
]
