from django.urls import path
from .views import TimelineEventListView

urlpatterns = [
    path('', TimelineEventListView.as_view(), name='timeline-list'),
]
