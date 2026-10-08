from rest_framework import generics
from .models import Contradiction, MissingInformation
from .serializers import ContradictionSerializer, MissingInformationSerializer

class ContradictionListView(generics.ListCreateAPIView):
    serializer_class = ContradictionSerializer

    def get_queryset(self):
        case_id = self.request.query_params.get('case_id')
        category = self.request.query_params.get('category')
        qs = Contradiction.objects.all()
        if case_id:
            qs = qs.filter(case_id=case_id)
        if category:
            qs = qs.filter(category=category)
        return qs

class MissingInformationListView(generics.ListCreateAPIView):
    serializer_class = MissingInformationSerializer

    def get_queryset(self):
        case_id = self.request.query_params.get('case_id')
        category = self.request.query_params.get('category')
        qs = MissingInformation.objects.all()
        if case_id:
            qs = qs.filter(case_id=case_id)
        if category:
            qs = qs.filter(category=category)
        return qs
