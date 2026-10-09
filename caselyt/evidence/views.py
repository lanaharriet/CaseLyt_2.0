from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from .models import Evidence, Claim, Finding, GraphNode, GraphEdge
from .serializers import (
    EvidenceSerializer, ClaimSerializer, FindingSerializer,
    GraphNodeSerializer, GraphEdgeSerializer
)

class EvidenceListView(generics.ListCreateAPIView):
    serializer_class = EvidenceSerializer

    def get_queryset(self):
        case_id = self.request.query_params.get('case_id')
        if case_id:
            return Evidence.objects.filter(case_id=case_id).order_by('-relevance_score')
        return Evidence.objects.all().order_by('-relevance_score')

class ClaimListView(generics.ListCreateAPIView):
    serializer_class = ClaimSerializer

    def get_queryset(self):
        case_id = self.request.query_params.get('case_id')
        if case_id:
            return Claim.objects.filter(case_id=case_id)
        return Claim.objects.all()

class FindingListView(generics.ListCreateAPIView):
    serializer_class = FindingSerializer

    def get_queryset(self):
        case_id = self.request.query_params.get('case_id')
        if case_id:
            return Finding.objects.filter(case_id=case_id)
        return Finding.objects.all()

class EvidenceGraphView(APIView):
    def get(self, request):
        case_id = request.query_params.get('case_id')
        if case_id:
            nodes = GraphNode.objects.filter(case_id=case_id)
            edges = GraphEdge.objects.filter(case_id=case_id)
        else:
            nodes = GraphNode.objects.all()
            edges = GraphEdge.objects.all()
        
        node_serializer = GraphNodeSerializer(nodes, many=True)
        edge_serializer = GraphEdgeSerializer(edges, many=True)
        
        return Response({
            'nodes': node_serializer.data,
            'edges': edge_serializer.data
        })

class CaseDNAView(APIView):
    def get(self, request):
        case_id = request.query_params.get('case_id')
        
        # Filter by case_id if provided
        nodes_qs = GraphNode.objects.filter(case_id=case_id) if case_id else GraphNode.objects.all()
        evidences = Evidence.objects.filter(case_id=case_id) if case_id else Evidence.objects.all()
        claims = Claim.objects.filter(case_id=case_id) if case_id else Claim.objects.all()
        findings = Finding.objects.filter(case_id=case_id) if case_id else Finding.objects.all()

        people_nodes = nodes_qs.filter(type='Person')
        location_nodes = nodes_qs.filter(type='Location')
        event_nodes = nodes_qs.filter(type='Event')
        doc_nodes = nodes_qs.filter(type='Document')

        return Response({
            'people': [{'id': n.node_id, 'label': n.label} for n in people_nodes],
            'locations': [{'id': n.node_id, 'label': n.label} for n in location_nodes],
            'events': [{'id': n.node_id, 'label': n.label} for n in event_nodes],
            'documents': [{'id': n.node_id, 'label': n.label} for n in doc_nodes],
            'total_evidence_items': evidences.count(),
            'verified_claims_count': claims.filter(verification_status='VERIFIED').count(),
            'conflicting_claims_count': claims.filter(verification_status='CONFLICTING').count(),
            'key_findings_count': findings.count(),
        })

