from django.urls import path, include
from .views import SeedDataView

urlpatterns = [
    path('seed/', SeedDataView.as_view(), name='api-seed'),
    path('auth/', include('accounts.urls')),
    path('', include('documents.urls')),
    path('evidence/', include('evidence.urls')),
    path('timeline/', include('timeline.urls')),
    path('contradictions/', include('contradictions.urls')),
    path('retrieval/', include('retrieval.urls')),
    path('agents/', include('agents.urls')),
    path('drafting/', include('drafting.urls')),
    path('research/', include('research.urls')),
    path('reports/', include('reports.urls')),
]
