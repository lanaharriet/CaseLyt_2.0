from django.urls import path
from .views import GenerateLegalDraftView, ExportDraftWordView, ExportDraftPdfView, ExportDraftView

urlpatterns = [
    path('generate/', GenerateLegalDraftView.as_view(), name='drafting-generate'),
    path('export/docx/', ExportDraftWordView.as_view(), name='drafting-export-docx'),
    path('export/pdf/', ExportDraftPdfView.as_view(), name='drafting-export-pdf'),
    path('export/', ExportDraftView.as_view(), name='drafting-export'),
]
