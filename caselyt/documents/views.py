from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from .models import Case, Document, Page
from .serializers import CaseSerializer, DocumentSerializer
from .processor import DocumentProcessor

class CaseListCreateView(generics.ListCreateAPIView):
    queryset = Case.objects.all().order_by('-created_at')
    serializer_class = CaseSerializer

class CaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer

class DocumentListUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get(self, request):
        case_id = request.query_params.get('case_id')
        if case_id:
            docs = Document.objects.filter(case_id=case_id).order_by('-uploaded_at')
        else:
            docs = Document.objects.all().order_by('-uploaded_at')
        serializer = DocumentSerializer(docs, many=True)
        return Response(serializer.data)

    def post(self, request):
        case_id = request.data.get('case_id')
        case = Case.objects.filter(id=case_id).first() if case_id else Case.objects.first()

        if not case:
            case = Case.objects.create(
                title="State vs. Vikram Malhotra & Ors. (Financial Fraud & Alibi Verification)",
                case_number="FIR No. 204/2024 (EOW / Special CBI Court)",
                jurisdiction="High Court of Delhi / Special CBI Court, New Delhi",
                description="Complex financial fraud and criminal conspiracy prosecution."
            )
        
        file_obj = request.FILES.get('file')
        filename = request.data.get('filename') or (file_obj.name if file_obj else "Uploaded_Document.pdf")
        doc_type = 'PDF'
        if filename.lower().endswith('.docx') or filename.lower().endswith('.doc'):
            doc_type = 'DOCX'
        elif filename.lower().endswith('.txt'):
            doc_type = 'TXT'

        doc = Document.objects.create(
            case=case,
            filename=filename,
            doc_type=doc_type,
            file=file_obj,
            status='PENDING',
            evidence_count=1,
            conflicts_count=0
        )

        # Trigger processing
        DocumentProcessor.process_document(doc)

        # Refresh from db
        doc.refresh_from_db()
        
        serializer = DocumentSerializer(doc)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class DocumentDetailView(APIView):
    def get(self, request, pk):
        doc = get_object_or_404(Document, pk=pk)
        serializer = DocumentSerializer(doc)
        return Response(serializer.data)

    def patch(self, request, pk):
        doc = get_object_or_404(Document, pk=pk)
        if 'filename' in request.data:
            doc.filename = request.data['filename']
            doc.save()
        serializer = DocumentSerializer(doc)
        return Response(serializer.data)

    def delete(self, request, pk):
        doc = get_object_or_404(Document, pk=pk)
        doc.delete()
        return Response({'message': 'Document deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

class DocumentReprocessView(APIView):
    def post(self, request, pk):
        doc = get_object_or_404(Document, pk=pk)
        # Clear existing pages and paragraphs
        doc.pages.all().delete()
        success = DocumentProcessor.process_document(doc)
        serializer = DocumentSerializer(doc)
        return Response({
            'success': success,
            'document': serializer.data
        })
