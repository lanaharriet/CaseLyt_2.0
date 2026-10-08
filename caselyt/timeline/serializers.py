from rest_framework import serializers
from .models import TimelineEvent

class TimelineEventSerializer(serializers.ModelSerializer):
    document_filename = serializers.SerializerMethodField()

    class Meta:
        model = TimelineEvent
        fields = [
            'id', 'case', 'date_str', 'event_timestamp', 'title',
            'description', 'document', 'document_id_str', 'document_filename',
            'page_number', 'paragraph_id', 'source_text',
            'has_conflict', 'conflict_details'
        ]

    def get_document_filename(self, obj):
        return obj.document.filename if obj.document else obj.document_id_str
