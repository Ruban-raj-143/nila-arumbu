"""
Nila Arumbu — Audit Log Model
Immutable record of all significant system events.
"""
from sqlalchemy import Column, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.infrastructure.database.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    changes = Column(JSON, nullable=True)   # {before: {}, after: {}}
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
