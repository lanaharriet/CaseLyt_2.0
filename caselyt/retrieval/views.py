from rest_framework.views import APIView
from rest_framework.response import Response
from .engine import HybridRetrievalEngine

class EvidenceSearchView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        case_id = request.query_params.get('case_id')
        
        if not query:
            return Response({'query': '', 'results_count': 0, 'results': []})

        results = HybridRetrievalEngine.search(query=query, case_id=case_id, top_k=20)
        return Response({
            'query': query,
            'results_count': len(results),
            'results': results
        })
