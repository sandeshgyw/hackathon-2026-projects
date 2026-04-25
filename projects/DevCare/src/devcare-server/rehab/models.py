from django.conf import settings
from django.db import models


class ExerciseTemplate(models.Model):
	name = models.CharField(max_length=100, unique=True)
	description = models.TextField(blank=True)
	target_joint = models.CharField(max_length=100)
	instructions = models.TextField(blank=True)
	min_angle = models.FloatField()
	max_angle = models.FloatField()

	class Meta:
		ordering = ["name"]

	def __str__(self):
		return self.name

class ExerciseSession(models.Model):
	patient = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="rehab_sessions",
	)
	plan = models.ForeignKey(
		RehabPlan,
		on_delete=models.CASCADE,
		related_name="sessions",
	)
	started_at = models.DateTimeField(auto_now_add=True)
	completed_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		ordering = ["-started_at"]

	def __str__(self):
		return f"Session #{self.id} - {self.patient}"
