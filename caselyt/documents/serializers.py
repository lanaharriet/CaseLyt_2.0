import django.utils.timezone as tz
from rest_framework import serializers
from .models import Case, Document, Page, Paragraph

class ParagraphSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paragraph
        fields = ['id', 'paragraph_number', 'text']

class PageSerializer(serializers.ModelSerializer):
    paragraphs = ParagraphSerializer(many=True, read_only=True)

    class Meta:
        model = Page
        fields = ['id', 'page_number', 'content', 'paragraphs']

class DocumentSerializer(serializers.ModelSerializer):
    pages = PageSerializer(many=True, read_only=True)
    uploaded_at_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'case', 'filename', 'doc_type', 'file', 
            'page_count', 'status', 'ocr_applied', 'evidence_count', 
            'conflicts_count', 'uploaded_at', 'uploaded_at_formatted', 'pages'
        ]

    def get_uploaded_at_formatted(self, obj):
        local_time = tz.localtime(obj.uploaded_at)
        return local_time.strftime("%Y-%m-%d %H:%M:%S IST")


class CaseSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    document_count = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = ['id', 'title', 'case_number', 'jurisdiction', 'description', 'created_at', 'updated_at', 'documents', 'document_count']

    def get_document_count(self, obj):
        return obj.documents.count()
