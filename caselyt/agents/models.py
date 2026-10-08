import uuid
from django.db import models
from documents.models import Case

class AgentStep(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('RUNNING', 'In Progress'),
        ('COMPLETED', '✓ Completed'),
        ('FAILED', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='agent_steps')
    agent_name = models.CharField(max_length=100)
    display_title = models.CharField(max_length=255) # High level display e.g. "✓ Documents Processed"
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='COMPLETED')
    details_summary = models.TextField(blank=True, default="")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.display_title} - {self.status}"
