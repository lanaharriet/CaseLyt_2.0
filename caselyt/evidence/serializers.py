import json
from rest_framework import serializers
from .models import Evidence, Claim, Finding, GraphNode, GraphEdge

class EvidenceSerializer(serializers.ModelSerializer):
    document_filename = serializers.SerializerMethodField()

    class Meta:
        model = Evidence
        fields = [
            'id', 'case', 'title', 'evidence_type', 'document', 
            'document_id_str', 'document_filename', 'page_number', 
            'paragraph_id', 'source_text', 'relevance_score', 
            'verification_status', 'created_at'
        ]

    def get_document_filename(self, obj):
        return obj.document.filename if obj.document else obj.document_id_str

class ClaimSerializer(serializers.ModelSerializer):
    document_filename = serializers.SerializerMethodField()

    class Meta:
        model = Claim
        fields = [
            'id', 'case', 'claim_text', 'source_document', 'document_id_str',
            'document_filename', 'page_number', 'paragraph_id', 'evidence_passage',
            'verification_status', 'conflict_notes', 'created_at'
        ]

    def get_document_filename(self, obj):
        return obj.source_document.filename if obj.source_document else obj.document_id_str

class FindingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Finding
        fields = [
            'id', 'case', 'fact_statement', 'category', 'verification_status',
            'document_id_str', 'page_number', 'paragraph_id', 'source_text'
        ]

class GraphNodeSerializer(serializers.ModelSerializer):
    properties = serializers.SerializerMethodField()

    class Meta:
        model = GraphNode
        fields = ['id', 'case', 'node_id', 'label', 'type', 'properties']

    def get_properties(self, obj):
        try:
            return json.loads(obj.properties_json)
        except Exception:
            return {}

class GraphEdgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GraphEdge
        fields = ['id', 'case', 'source', 'target', 'relationship', 'details']
