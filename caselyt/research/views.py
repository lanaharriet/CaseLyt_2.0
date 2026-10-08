from rest_framework.views import APIView
from rest_framework.response import Response
from .engine import ResearchWorkspaceEngine

class QueryResearchWorkspaceView(APIView):
    def post(self, request):
        question = request.data.get('question', '').strip()
        case_id = request.data.get('case_id')
        
        if not question:
            return Response({
                'answer': 'NOT FOUND IN PROVIDED DOCUMENTS',
                'sources': [],
                'evidence': []
            })

        result = ResearchWorkspaceEngine.answer_query(question=question, case_id=case_id)
        return Response(result)
