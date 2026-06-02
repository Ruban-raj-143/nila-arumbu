"""
Nila Arumbu — Parent Engagement Schemas
"""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class EngagementCreate(BaseModel):
    child_id: UUID
    parent_id: UUID | None = None
    engagement_type: str = Field(
        ...,
        pattern="^(DAILY_ACTIVITY|WEEKLY_REMINDER|REFERRAL_REMINDER|DEVELOPMENT_NUDGE|PROGRESS_SUMMARY)$",
    )
    channel: str = Field(..., pattern="^(WHATSAPP|SMS|IN_APP)$")
    message: str
    metadata: dict | None = None


class EngagementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    child_id: UUID
    parent_id: UUID | None
    engagement_type: str
    channel: str
    message: str
    response: str | None
    status: str
    created_at: datetime
