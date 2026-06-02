"""
Nila Arumbu — Notification Schemas
"""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class NotificationCreate(BaseModel):
    recipient_id: UUID | None = None
    child_id: UUID | None = None
    channel: str = Field(..., pattern="^(WHATSAPP|SMS|EMAIL|PUSH)$")
    notification_type: str
    title: str
    body: str
    payload: dict | None = None


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    recipient_id: UUID | None
    child_id: UUID | None
    channel: str
    notification_type: str
    title: str
    body: str
    status: str
    retry_count: str
    error_message: str | None
    created_at: datetime
