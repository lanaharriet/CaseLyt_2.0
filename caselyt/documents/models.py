import uuid
from django.db import models

class Case(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    case_number = models.CharField(max_length=100, unique=True)
    jurisdiction = models.CharField(max_length=255, default="High Court of Delhi / Special CBI Court")
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.case_number} - {self.title}"

class Document(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Processing'),
        ('PROCESSING', 'Processing Text & OCR'),
        ('INDEXED', 'Indexed & Verified'),
        ('FAILED', 'Processing Failed'),
    ]
    
    DOC_TYPES = [
        ('PDF', 'PDF Document'),
        ('DOCX', 'Word Document'),
        ('TXT', 'Text File'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='documents')
    filename = models.CharField(max_length=255)
    doc_type = models.CharField(max_length=20, choices=DOC_TYPES, default='PDF')
    file = models.FileField(upload_to='case_documents/', null=True, blank=True)
    page_count = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    ocr_applied = models.BooleanField(default=False)
    evidence_count = models.IntegerField(default=0)
    conflicts_count = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.filename} ({self.status})"

class Page(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='pages')
    page_number = models.IntegerField()
    content = models.TextField()

    class Meta:
        ordering = ['page_number']

    def __str__(self):
        return f"{self.document.filename} - Page {self.page_number}"

class Paragraph(models.Model):
    id = models.CharField(max_length=100, primary_key=True) # e.g. DOC_001_P1_PAR1
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='paragraphs')
    paragraph_number = models.IntegerField()
    text = models.TextField()
    embedding_json = models.TextField(blank=True, default='[]')

    class Meta:
        ordering = ['paragraph_number']

    def __str__(self):
        return f"{self.id}: {self.text[:40]}..."
