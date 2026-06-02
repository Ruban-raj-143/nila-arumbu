"""
Nila Arumbu — Growth Schemas
"""
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class GrowthRecordCreate(BaseModel):
    child_id: UUID
    recorded_date: date
    weight_kg: float | None = Field(None, gt=0, lt=100)
    height_cm: float | None = Field(None, gt=0, lt=200)
    muac_cm: float | None = Field(None, gt=0, lt=40)
    notes: str | None = None


class GrowthRecordRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    child_id: UUID
    recorded_date: date
    weight_kg: float | None
    height_cm: float | None
    muac_cm: float | None
    weight_for_age_z: float | None
    height_for_age_z: float | None
    weight_for_height_z: float | None
    nutrition_status: str | None
    notes: str | None
    created_at: datetime


class GrowthTrend(BaseModel):
    child_id: UUID
    records: list[GrowthRecordRead]
    latest_status: str | None
    trend_direction: str  # IMPROVING | DECLINING | STABLE | INSUFFICIENT_DATA
