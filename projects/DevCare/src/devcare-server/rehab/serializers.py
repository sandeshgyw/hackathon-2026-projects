from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from user.models import UserProfile

from .models import (
    ExerciseTemplate,
)


User = get_user_model()


class ExerciseTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseTemplate
        fields = [
            "id",
            "name",
            "description",
            "target_joint",
            "instructions",
            "min_angle",
            "max_angle",
        ]


class SessionStartSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField(min_value=1)


