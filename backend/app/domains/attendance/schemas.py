"""
Nila Arumbu — Attendance Schemas
"""
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class AttendanceCreate(BaseModel):
    child_id: UUID
    centre_id: UUID
    session_date: date
    status: str = Field(..., pattern="^(PRESENT|ABSENT|EXCUSED)$")
    notes: str | None = None


class AttendanceBulkCreate(BaseModel):
    """Record attendance for multiple children in one request."""
    centre_id: UUID
    session_date: date
    records: list[dict]   # [{child_id, status, notes?}]


class AttendanceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    child_id: UUID
    centre_id: UUID
    session_date: date
    status: str
    notes: str | None
    created_at: datetime


class AttendanceSummary(BaseModel):
    child_id: UUID
    total_sessions: int
    attended: int
    absent: int
    excused: int
    attendance_rate: float
