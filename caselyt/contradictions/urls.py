from django.urls import path
from .views import ContradictionListView, MissingInformationListView

urlpatterns = [
    path('radar/', ContradictionListView.as_view(), name='contradiction-radar'),
    path('missing/', MissingInformationListView.as_view(), name='missing-info'),
]
