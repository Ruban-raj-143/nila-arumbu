"""
Nila Arumbu — Parent Engagement Domain Models
Tracks all parent/caregiver engagement interactions.
"""
from sqlalchemy import Column, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.infrastructure.database.base import Base


class ParentEngagementLog(Base):
    """
    Records every engagement touchpoint with a parent/caregiver.
    Channels: WhatsApp | SMS | In-App
    Types: DAILY_ACTIVITY | WEEKLY_REMINDER | REFERRAL_REMINDER | DEVELOPMENT_NUDGE | PROGRESS_SUMMARY
    """
    __tablename__ = "parent_engagement_logs"

    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id"), nullable=False, index=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)

    engagement_type = Column(String(50), nullable=False)
    channel = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=True)   # Parent's reply if captured
    status = Column(String(20), nullable=False, default="SENT")  # SENT | READ | RESPONDED
    extra_data = Column(JSON, nullable=True)
    sent_by = Column(UUID(as_uuid=True), nullable=True)
