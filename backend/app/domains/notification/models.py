"""
Nila Arumbu — Notification Domain Models
"""
from sqlalchemy import Column, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.infrastructure.database.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    recipient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id"), nullable=True, index=True)

    channel = Column(String(20), nullable=False)   # WHATSAPP | SMS | EMAIL | PUSH
    notification_type = Column(String(50), nullable=False)
    # ATTENDANCE_ALERT | GROWTH_ALERT | RISK_ALERT | REFERRAL_ALERT | SUPERVISOR_ALERT

    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    payload = Column(JSON, nullable=True)

    status = Column(String(20), nullable=False, default="PENDING")
    # PENDING | SENT | DELIVERED | FAILED

    retry_count = Column(String(5), nullable=False, default="0")
    error_message = Column(Text, nullable=True)
    sent_by = Column(UUID(as_uuid=True), nullable=True)
