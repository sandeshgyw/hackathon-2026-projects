from pydantic import BaseModel, Field
from typing import Optional

class TriageRequest(BaseModel):
    symptoms: list[str] = Field(..., min_length=1, description="List of symptom strings (English or Nepali)")
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = Field(None, pattern="^(male|female|other)$")
    duration_days: Optional[int] = Field(None, ge=0)
    language: Optional[str] = Field("en", description="Input language: 'en', 'ne', or 'ne-rom'")

class ConditionResult(BaseModel):
    condition: str
    severity: str
    confidence: int

class TriageResponse(BaseModel):
    severity: str
    severity_label: str
    advice: str
    advice_ne: Optional[str] = None
    possible_conditions: list[ConditionResult]
    matched_symptoms: list[str]
    risk_flags: list[str]
    confidence: int
    translated_symptoms: Optional[list[str]] = None
