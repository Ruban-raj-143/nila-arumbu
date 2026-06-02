"""
Nila Arumbu — Child Domain Schemas (Pydantic v2)
"""
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


# ── Centre ────────────────────────────────────────────────────────────────────

class CentreCreate(BaseModel):
    name: str = Field(..., min_length=2)
    code: str = Field(..., min_length=2, max_length=50)
    district: str
    block: str
    village: str
    pincode: str | None = None
    latitude: str | None = None
    longitude: str | None = None


class CentreRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    code: str
    district: str
    block: str
    village: str
    pincode: str | None
    is_active: str
    created_at: datetime


# ── Child ─────────────────────────────────────────────────────────────────────

class ChildCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: date
    gender: str = Field(..., pattern="^(MALE|FEMALE|OTHER)$")
    aadhaar_number: str | None = Field(None, min_length=12, max_length=12)
    mother_name: str | None = None
    father_name: str | None = None
    guardian_name: str | None = None
    guardian_phone: str | None = Field(None, pattern=r"^\+?[0-9]{10,15}$")
    address: str | None = None
    centre_id: UUID | None = None


class ChildUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    guardian_name: str | None = None
    guardian_phone: str | None = None
    address: str | None = None
    centre_id: UUID | None = None


class ChildRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    aadhaar_number: str | None
    mother_name: str | None
    father_name: str | None
    guardian_name: str | None
    guardian_phone: str | None
    centre_id: UUID | None
    created_at: datetime
    updated_at: datetime


# ── Child Passport ────────────────────────────────────────────────────────────

class ChildPassportRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    child_id: UUID
    passport_number: str
    current_risk_level: str
    current_risk_score: str
    total_attendance_sessions: int
    attended_sessions: int
    last_growth_recorded_at: date | None
    last_assessment_at: date | None
    active_referral_count: int
    notes: str | None
    updated_at: datetime


class ChildPassportFull(BaseModel):
    """Complete child passport — aggregates all domain summaries."""
    model_config = ConfigDict(from_attributes=True)
    child: ChildRead
    passport: ChildPassportRead


# ── Migration ─────────────────────────────────────────────────────────────────

class MigrationCreate(BaseModel):
    child_id: UUID
    to_centre_id: UUID
    migration_date: date
    reason: str | None = None


class MigrationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    child_id: UUID
    from_centre_id: UUID | None
    to_centre_id: UUID
    migration_date: date
    reason: str | None
    created_at: datetime
