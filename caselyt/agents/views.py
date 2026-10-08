from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from .models import AgentStep
from .serializers import AgentStepSerializer
from .verifier import VerificationGate

class AgentActivityListView(generics.ListAPIView):
    serializer_class = AgentStepSerializer

    def get_queryset(self):
        case_id = self.request.query_params.get('case_id')
        if case_id:
            return AgentStep.objects.filter(case_id=case_id)
        return AgentStep.objects.all()

class VerifyClaimAPIView(APIView):
    def post(self, request):
        claim_text = request.data.get('claim_text', '')
        document_id_str = request.data.get('document_id_str')
        page_number = request.data.get('page_number', 1)
        paragraph_id = request.data.get('paragraph_id')
        source_text = request.data.get('source_text')

        res = VerificationGate.verify_claim(
            claim_text=claim_text,
            document_id_str=document_id_str,
            page_number=page_number,
            paragraph_id=paragraph_id,
            source_text=source_text
        )

        return Response(res)
