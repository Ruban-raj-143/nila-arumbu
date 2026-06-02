"""
Nila Arumbu — Risk Schemas
"""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class RiskInput(BaseModel):
    child_id: UUID
    # Attendance
    total_sessions: int = Field(0, ge=0)
    attended_sessions: int = Field(0, ge=0)
    # Nutrition
    weight_for_age_z: float = 0.0
    height_for_age_z: float = 0.0
    muac_cm: float = Field(15.0, gt=0)
    # Development
    development_milestone_score: float = Field(100.0, ge=0, le=100)
    # Caregiver
    primary_caregiver_present: bool = True
    caregiver_literate: bool = True
    household_income_below_poverty: bool = False
    # Migration
    has_migrated_in_last_6_months: bool = False
    migration_count_last_year: int = Field(0, ge=0)


class RiskScoreRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    child_id: UUID
    total_score: float
    risk_level: str
    attendance_score: float
    nutrition_score: float
    development_score: float
    caregiver_score: float
    migration_score: float
    contributing_factors: list[str]
    weight_breakdown: dict
    explanation: str
    created_at: datetime


class RiskHistory(BaseModel):
    child_id: UUID
    scores: list[RiskScoreRead]
