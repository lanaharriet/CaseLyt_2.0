import urllib.parse
from django.http import HttpResponse
from django.views import View
from rest_framework.views import APIView
from rest_framework.response import Response
from .engine import LegalDraftingEngine

class GenerateLegalDraftView(APIView):
    def post(self, request):
        draft_type = request.data.get('draft_type', 'BAIL_APPLICATION')
        custom_prompt = request.data.get('custom_prompt', '')
        instructions = request.data.get('instructions', '')
        case_id = request.data.get('case_id')
        
        draft_result = LegalDraftingEngine.generate_draft(
            draft_type=draft_type,
            custom_prompt=custom_prompt,
            instructions=instructions,
            case_id=case_id
        )
        return Response(draft_result)

class ExportDraftWordView(View):
    def get(self, request):
        draft_type = request.GET.get('draft_type', 'BAIL_APPLICATION')
        custom_prompt = request.GET.get('custom_prompt', '')
        instructions = request.GET.get('instructions', '')
        case_id = request.GET.get('case_id')

        draft = LegalDraftingEngine.generate_draft(
            draft_type=draft_type,
            custom_prompt=custom_prompt,
            instructions=instructions,
            case_id=case_id
        )

        buffer = LegalDraftingEngine.generate_draft_docx(
            title=draft.get('title', 'Legal Draft'),
            content=draft.get('content', '')
        )

        filename = f"CASELYT_{draft_type.upper().replace(' ', '_')}.docx"
        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    def post(self, request):
        import json
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            data = request.POST

        title = data.get('title', 'Legal Draft')
        content = data.get('content', '')

        if not content:
            draft = LegalDraftingEngine.generate_draft(
                draft_type=data.get('draft_type', 'BAIL_APPLICATION'),
                custom_prompt=data.get('custom_prompt', ''),
                instructions=data.get('instructions', ''),
                case_id=data.get('case_id')
            )
            title = draft.get('title', title)
            content = draft.get('content', '')

        buffer = LegalDraftingEngine.generate_draft_docx(title=title, content=content)
        clean_title = "".join(c for c in title if c.isalnum() or c in (' ', '_', '-')).rstrip()
        filename = f"CASELYT_{clean_title.replace(' ', '_')[:40]}.docx"

        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

class ExportDraftPdfView(View):
    def get(self, request):
        draft_type = request.GET.get('draft_type', 'BAIL_APPLICATION')
        custom_prompt = request.GET.get('custom_prompt', '')
        instructions = request.GET.get('instructions', '')
        case_id = request.GET.get('case_id')

        draft = LegalDraftingEngine.generate_draft(
            draft_type=draft_type,
            custom_prompt=custom_prompt,
            instructions=instructions,
            case_id=case_id
        )

        buffer = LegalDraftingEngine.generate_draft_pdf(
            title=draft.get('title', 'Legal Draft'),
            content=draft.get('content', '')
        )

        filename = f"CASELYT_{draft_type.upper().replace(' ', '_')}.pdf"
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        return response

    def post(self, request):
        import json
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            data = request.POST

        title = data.get('title', 'Legal Draft')
        content = data.get('content', '')

        if not content:
            draft = LegalDraftingEngine.generate_draft(
                draft_type=data.get('draft_type', 'BAIL_APPLICATION'),
                custom_prompt=data.get('custom_prompt', ''),
                instructions=data.get('instructions', ''),
                case_id=data.get('case_id')
            )
            title = draft.get('title', title)
            content = draft.get('content', '')

        buffer = LegalDraftingEngine.generate_draft_pdf(title=title, content=content)
        clean_title = "".join(c for c in title if c.isalnum() or c in (' ', '_', '-')).rstrip()
        filename = f"CASELYT_{clean_title.replace(' ', '_')[:40]}.pdf"

        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        return response

class ExportDraftView(View):
    """Universal export handler accepting format=docx or format=pdf"""
    def get(self, request):
        export_format = request.GET.get('format', 'docx').lower()
        if export_format == 'pdf':
            return ExportDraftPdfView().get(request)
        return ExportDraftWordView().get(request)

    def post(self, request):
        export_format = request.GET.get('format', 'docx').lower()
        if export_format == 'pdf':
            return ExportDraftPdfView().post(request)
        return ExportDraftWordView().post(request)
