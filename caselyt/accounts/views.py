from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User

class CurrentUserView(APIView):
    def get(self, request):
        user, _ = User.objects.get_or_create(username='lead_investigator', defaults={
            'email': 'investigator@caselyt.law',
            'first_name': 'Senior Partner',
            'last_name': 'Counsel'
        })
        return Response({
            'username': user.username,
            'email': user.email,
            'name': 'Adv. Vikramaditya Sharma',
            'role': 'Senior Criminal Defense & Evidence Architect',
            'organization': 'Delhi High Court / Evidence Intelligence Bureau'
        })
