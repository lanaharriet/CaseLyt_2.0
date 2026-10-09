import django.utils.timezone as tz
from rest_framework import serializers
from .models import AgentStep

class AgentStepSerializer(serializers.ModelSerializer):
    timestamp_formatted = serializers.SerializerMethodField()

    class Meta:
        model = AgentStep
        fields = ['id', 'case', 'agent_name', 'display_title', 'status', 'details_summary', 'timestamp', 'timestamp_formatted']

    def get_timestamp_formatted(self, obj):
        local_time = tz.localtime(obj.timestamp)
        return local_time.strftime("%H:%M:%S IST")

