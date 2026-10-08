from rest_framework.views import APIView
from rest_framework.response import Response
from .engine import LegalDraftingEngine

class GenerateLegalDraftView(APIView):
    def post(self, request):
        draft_type = request.data.get('draft_type', 'BAIL_APPLICATION')
        case_id = request.data.get('case_id')
        
        draft_result = LegalDraftingEngine.generate_draft(draft_type=draft_type, case_id=case_id)
        return Response(draft_result)
