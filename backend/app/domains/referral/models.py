"""
Nila Arumbu — Referral Domain Models
State machine enforced referral lifecycle with full audit trail.
"""
from sqlalchemy import Boolean, Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.infrastructure.database.base import Base


class Referral(Base):
    __tablename__ = "referrals"

    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id"), nullable=False, index=True)
    reason = Column(Text, nullable=False)
    referral_type = Column(String(100), nullable=False)  # HOSPITAL | NRC | PHC | SPECIALIST | NGO
    status = Column(String(50), nullable=False, default="IDENTIFIED", index=True)
    referred_to = Column(String(255), nullable=True)
    escalated = Column(Boolean, default=False, nullable=False)
    escalation_reason = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    assigned_to = Column(UUID(as_uuid=True), nullable=True)

    child = relationship("Child", back_populates="referrals")
    status_logs = relationship(
        "ReferralStatusLog",
        back_populates="referral",
        lazy="selectin",
        order_by="ReferralStatusLog.created_at",
    )


class ReferralStatusLog(Base):
    """Immutable audit trail — never deleted."""
    __tablename__ = "referral_status_logs"

    referral_id = Column(UUID(as_uuid=True), ForeignKey("referrals.id"), nullable=False, index=True)
    from_status = Column(String(50), nullable=True)
    to_status = Column(String(50), nullable=False)
    changed_by = Column(UUID(as_uuid=True), nullable=True)
    notes = Column(Text, nullable=True)

    referral = relationship("Referral", back_populates="status_logs")
