from rest_framework import generics
from .models import TimelineEvent
from .serializers import TimelineEventSerializer

class TimelineEventListView(generics.ListCreateAPIView):
    serializer_class = TimelineEventSerializer

    def get_queryset(self):
        case_id = self.request.query_params.get('case_id')
        if case_id:
            return TimelineEvent.objects.filter(case_id=case_id)
        return TimelineEvent.objects.all()
