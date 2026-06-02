"""
Nila Arumbu — Learning Planner Schemas
"""
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class LearningPlanRequest(BaseModel):
    child_id: UUID
    plan_date: date
    age_in_months: int = Field(..., ge=0, le=72)
    risk_level: str = Field(..., pattern="^(GREEN|YELLOW|RED)$")
    developmental_status: str = Field(
        ..., pattern="^(ON_TRACK|MILD_DELAY|MODERATE_DELAY|SEVERE_DELAY)$"
    )
    referral_outcome: str | None = None
    notes: str | None = None


class LearningActivityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    child_id: UUID
    plan_date: date
    age_in_months: str
    risk_level: str
    developmental_status: str
    centre_activities: list
    home_activities: list
    school_readiness_tasks: list
    notes: str | None
    created_at: datetime
