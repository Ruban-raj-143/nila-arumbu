"""
Nila Arumbu — Referral Schemas
"""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class ReferralCreate(BaseModel):
    child_id: UUID
    reason: str = Field(..., min_length=5)
    referral_type: str = Field(..., pattern="^(HOSPITAL|NRC|PHC|SPECIALIST|NGO|OTHER)$")
    referred_to: str | None = None
    notes: str | None = None


class ReferralTransition(BaseModel):
    target_state: str
    notes: str | None = None


class ReferralStatusLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    from_status: str | None
    to_status: str
    notes: str | None
    created_at: datetime


class ReferralRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    child_id: UUID
    reason: str
    referral_type: str
    status: str
    referred_to: str | None
    notes: str | None
    escalated: bool
    escalation_reason: str | None
    created_at: datetime
    updated_at: datetime
    status_logs: list[ReferralStatusLogRead] = []
    allowed_transitions: list[str] = []


class EscalateRequest(BaseModel):
    reason: str = Field(..., min_length=5)
