from django.contrib import admin

from .models import (
	ExerciseSession,
	ExerciseTemplate,

)


@admin.register(ExerciseTemplate)
class ExerciseTemplateAdmin(admin.ModelAdmin):
	list_display = ("id", "name", "target_joint", "min_angle", "max_angle")
	search_fields = ("name", "target_joint")


class RehabPlanExerciseInline(admin.TabularInline):
	model = RehabPlanExercise
	extra = 1


@admin.register(RehabPlan)
class RehabPlanAdmin(admin.ModelAdmin):
	list_display = ("id", "name", "doctor", "patient", "created_at")
	search_fields = ("name", "doctor__username", "patient__username")
	inlines = [RehabPlanExerciseInline]


@admin.register(ExerciseSession)
class ExerciseSessionAdmin(admin.ModelAdmin):
	list_display = ("id", "patient", "plan", "started_at", "completed_at")
	search_fields = ("patient__username", "plan__name")

