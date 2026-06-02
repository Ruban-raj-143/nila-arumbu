"""
Nila Arumbu — Attendance Domain Models
"""
from sqlalchemy import Column, Date, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.infrastructure.database.base import Base


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id"), nullable=False, index=True)
    centre_id = Column(UUID(as_uuid=True), ForeignKey("centres.id"), nullable=False, index=True)
    session_date = Column(Date, nullable=False, index=True)
    status = Column(String(20), nullable=False)   # PRESENT | ABSENT | EXCUSED
    recorded_by = Column(UUID(as_uuid=True), nullable=True)
    notes = Column(Text, nullable=True)

    child = relationship("Child", back_populates="attendance_records")
