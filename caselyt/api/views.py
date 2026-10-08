from rest_framework.views import APIView
from rest_framework.response import Response
from .seed_data import populate_seed_data
from documents.models import Case
from documents.serializers import CaseSerializer

class SeedDataView(APIView):
    def post(self, request):
        case_obj = populate_seed_data()
        serializer = CaseSerializer(case_obj)
        return Response({
            'message': 'Case file seeded successfully with rich legal intelligence data.',
            'case': serializer.data
        })
