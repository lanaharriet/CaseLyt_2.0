from django.http import HttpResponse
from django.views import View
from .generator import CaseReportGenerator

class ExportReportView(View):
    def get(self, request):
        format_type = request.GET.get('format', 'pdf').lower()
        case_id = request.GET.get('case_id')

        if format_type == 'docx':
            buffer = CaseReportGenerator.generate_docx_report(case_id=case_id)
            response = HttpResponse(
                buffer.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            )
            response['Content-Disposition'] = 'attachment; filename="CASELYT_Evidence_Report.docx"'
            return response
        else:
            buffer = CaseReportGenerator.generate_pdf_report(case_id=case_id)
            response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = 'inline; filename="CASELYT_Evidence_Report.pdf"'
            return response
