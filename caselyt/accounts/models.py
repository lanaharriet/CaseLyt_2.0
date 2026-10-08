from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=50, default='Lead Legal Investigator')
    organization = models.CharField(max_length=255, default='High Court Bar / Forensic Intelligence Unit')

    def __str__(self):
        return f"{self.user.username} ({self.role})"
