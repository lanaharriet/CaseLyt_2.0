import uuid
from django.db import models
from documents.models import Case, Document

class TimelineEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='timeline_events')
    date_str = models.CharField(max_length=100)
    event_timestamp = models.DateTimeField(null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    document = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True)
    document_id_str = models.CharField(max_length=100)
    page_number = models.IntegerField(default=1)
    paragraph_id = models.CharField(max_length=100)
    source_text = models.TextField()
    has_conflict = models.BooleanField(default=False)
    conflict_details = models.TextField(blank=True, default="")

    class Meta:
        ordering = ['event_timestamp', 'date_str']

    def __str__(self):
        return f"[{self.date_str}] {self.title} (Conflict: {self.has_conflict})"
