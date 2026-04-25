from django.urls import path

from .views import (
    ExerciseTemplateListView,
    SessionCompleteView,
    SessionStartView,
)

urlpatterns = [
    path("exercises/", ExerciseTemplateListView.as_view(), name="rehab-exercises-list"),
    path("sessions/start/", SessionStartView.as_view(), name="rehab-session-start"),
    path(
        "sessions/<int:session_id>/complete/",
        SessionCompleteView.as_view(),
        name="rehab-session-complete",
    ),
]
