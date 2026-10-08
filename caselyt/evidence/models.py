import uuid
from django.db import models
from documents.models import Case, Document

VERIFICATION_STATUSES = [
    ('VERIFIED', 'Verified in Source Text'),
    ('CONFLICTING', 'Contradicting Evidence Found'),
    ('UNVERIFIED', 'Unverified / Partial Support'),
    ('NOT FOUND', 'NOT FOUND IN PROVIDED DOCUMENTS'),
]

EVIDENCE_TYPES = [
    ('DOCUMENTARY', 'Documentary Evidence'),
    ('TESTIMONIAL', 'Witness / Depositional Statement'),
    ('FORENSIC', 'Audit / Technical Audit'),
    ('FINANCIAL', 'Bank Ledger / Transaction Record'),
    ('STATUTORY', 'Statutory / Regulatory Filing'),
]

class Evidence(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='evidences')
    title = models.CharField(max_length=255)
    evidence_type = models.CharField(max_length=50, choices=EVIDENCE_TYPES, default='DOCUMENTARY')
    document = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True)
    document_id_str = models.CharField(max_length=100) # Citation requirement
    page_number = models.IntegerField(default=1) # Citation requirement
    paragraph_id = models.CharField(max_length=100) # Citation requirement
    source_text = models.TextField() # Citation requirement (Never empty!)
    relevance_score = models.FloatField(default=0.95)
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUSES, default='VERIFIED')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.verification_status}] {self.title} ({self.document_id_str})"

class Claim(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='claims')
    claim_text = models.TextField()
    source_document = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True)
    document_id_str = models.CharField(max_length=100)
    page_number = models.IntegerField(default=1)
    paragraph_id = models.CharField(max_length=100)
    evidence_passage = models.TextField() # source_text
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUSES, default='VERIFIED')
    conflict_notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Claim: {self.claim_text[:50]} ({self.verification_status})"

class Finding(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='findings')
    fact_statement = models.TextField()
    category = models.CharField(max_length=50, default="Key Fact")
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUSES, default='VERIFIED')
    document_id_str = models.CharField(max_length=100)
    page_number = models.IntegerField(default=1)
    paragraph_id = models.CharField(max_length=100)
    source_text = models.TextField()

    def __str__(self):
        return f"Fact: {self.fact_statement[:40]}"

class GraphNode(models.Model):
    NODE_TYPES = [
        ('Person', 'Person'),
        ('Location', 'Location'),
        ('Date', 'Date'),
        ('Event', 'Event'),
        ('Document', 'Document'),
        ('Evidence', 'Evidence'),
        ('Claim', 'Claim'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='graph_nodes')
    node_id = models.CharField(max_length=100)
    label = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=NODE_TYPES)
    properties_json = models.TextField(default='{}')

    def __str__(self):
        return f"{self.type}: {self.label}"

class GraphEdge(models.Model):
    RELATIONSHIPS = [
        ('Supports', 'Supports'),
        ('Contradicts', 'Contradicts'),
        ('References', 'References'),
        ('Derived From', 'Derived From'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='graph_edges')
    source = models.CharField(max_length=100)
    target = models.CharField(max_length=100)
    relationship = models.CharField(max_length=50, choices=RELATIONSHIPS)
    details = models.TextField(blank=True, default="")

    def __str__(self):
        return f"{self.source} -[{self.relationship}]-> {self.target}"
