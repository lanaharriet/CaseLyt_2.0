from django.urls import path
from .views import GenerateLegalDraftView

urlpatterns = [
    path('generate/', GenerateLegalDraftView.as_view(), name='drafting-generate'),
]
