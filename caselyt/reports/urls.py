from django.urls import path
from .views import ExportReportView

urlpatterns = [
    path('export/', ExportReportView.as_view(), name='report-export'),
]
