"""
Nila Arumbu — Development Assessment Schemas
"""
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class MilestoneItem(BaseModel):
    milestone_id: str
    domain: str   # GROSS_MOTOR | FINE_MOTOR | LANGUAGE | COGNITIVE | SOCIAL_EMOTIONAL
    description: str
    achieved: bool


class AssessmentCreate(BaseModel):
    child_id: UUID
    assessed_date: date
    age_in_months: int = Field(..., ge=0, le=72)
    gross_motor_score: float = Field(..., ge=0, le=100)
    fine_motor_score: float = Field(..., ge=0, le=100)
    language_score: float = Field(..., ge=0, le=100)
    cognitive_score: float = Field(..., ge=0, le=100)
    social_emotional_score: float = Field(..., ge=0, le=100)
    milestones: list[MilestoneItem] = []
    notes: str | None = None


class AssessmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    child_id: UUID
    assessed_date: date
    age_in_months: int
    gross_motor_score: float
    fine_motor_score: float
    language_score: float
    cognitive_score: float
    social_emotional_score: float
    overall_milestone_score: float
    developmental_status: str
    milestones: list
    notes: str | None
    created_at: datetime


class DevelopmentSummary(BaseModel):
    child_id: UUID
    latest_status: str | None
    latest_overall_score: float | None
    assessment_count: int
    trend: str  # IMPROVING | DECLINING | STABLE | INSUFFICIENT_DATA
