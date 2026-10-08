from rest_framework import serializers
from .models import Contradiction, MissingInformation

class ContradictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contradiction
        fields = [
            'id', 'case', 'category', 'title', 'description',
            'source_a_doc', 'source_a_doc_name', 'source_a_page', 'source_a_para', 'source_a_text',
            'source_b_doc', 'source_b_doc_name', 'source_b_page', 'source_b_para', 'source_b_text',
            'severity', 'detected_at'
        ]

class MissingInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MissingInformation
        fields = [
            'id', 'case', 'topic', 'category', 'reason_flagged',
            'impact_assessment', 'required_evidence_type', 'flagged_at'
        ]
