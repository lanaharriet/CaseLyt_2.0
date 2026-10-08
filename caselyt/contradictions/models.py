import uuid
from django.db import models
from documents.models import Case, Document

CONTRADICTION_CATEGORIES = [
    ('DATES', 'Timeline / Date Discrepancy'),
    ('NAMES', 'Identity / Name Conflict'),
    ('LOCATIONS', 'Alibi / Location Discrepancy'),
    ('AMOUNTS', 'Financial Amount Variance'),
    ('EVENTS', 'Event Sequence Contradiction'),
    ('RELATIONSHIPS', 'Relationship / Affiliation Dispute'),
]

MISSING_INFO_CATEGORIES = [
    ('CONFIRMED', 'Fact Confirmed in Evidence'),
    ('CONFLICTING', 'Fact Inconsistent / Disputed'),
    ('MISSING', 'Critical Evidence Absent / Not Found'),
]

class Contradiction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='contradictions')
    category = models.CharField(max_length=50, choices=CONTRADICTION_CATEGORIES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Source A Citation
    source_a_doc = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True, related_name='contradictions_a')
    source_a_doc_name = models.CharField(max_length=255)
    source_a_page = models.IntegerField(default=1)
    source_a_para = models.CharField(max_length=100)
    source_a_text = models.TextField()

    # Source B Citation
    source_b_doc = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True, related_name='contradictions_b')
    source_b_doc_name = models.CharField(max_length=255)
    source_b_page = models.IntegerField(default=1)
    source_b_para = models.CharField(max_length=100)
    source_b_text = models.TextField()

    severity = models.CharField(max_length=20, default='HIGH')
    detected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.category}] {self.title}"

class MissingInformation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='missing_items')
    topic = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=MISSING_INFO_CATEGORIES, default='MISSING')
    reason_flagged = models.TextField()
    impact_assessment = models.TextField()
    required_evidence_type = models.CharField(max_length=100, default="Certified Bank Ledger / Sworn Affidavit")
    flagged_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.category}] {self.topic}"
