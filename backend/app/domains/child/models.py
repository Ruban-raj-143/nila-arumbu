"""
Nila Arumbu — Child Domain Models
Child, Centre, ChildPassport — the core identity entities of the platform.
"""
from sqlalchemy import Column, Date, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.infrastructure.database.base import Base


class Centre(Base):
    """Anganwadi centre — the physical service delivery unit."""
    __tablename__ = "centres"

    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    district = Column(String(100), nullable=False)
    block = Column(String(100), nullable=False)
    village = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=True)
    latitude = Column(String(20), nullable=True)
    longitude = Column(String(20), nullable=True)
    is_active = Column(String(5), default="True", nullable=False)

    children = relationship("Child", back_populates="centre")


class Child(Base):
    """
    Core child entity. Every child has exactly one active passport.
    The passport follows the child across centre migrations.
    """
    __tablename__ = "children"

    # Identity
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(10), nullable=False)          # MALE | FEMALE | OTHER
    aadhaar_number = Column(String(12), nullable=True, index=True)

    # Family
    mother_name = Column(String(255), nullable=True)
    father_name = Column(String(255), nullable=True)
    guardian_name = Column(String(255), nullable=True)
    guardian_phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)

    # Centre linkage
    centre_id = Column(UUID(as_uuid=True), ForeignKey("centres.id"), nullable=True)

    # Relationships
    centre = relationship("Centre", back_populates="children")
    passport = relationship("ChildPassport", back_populates="child", uselist=False)
    attendance_records = relationship("AttendanceRecord", back_populates="child")
    growth_records = relationship("GrowthRecord", back_populates="child")
    risk_scores = relationship("RiskScore", back_populates="child")
    referrals = relationship("Referral", back_populates="child")
    migration_history = relationship("MigrationHistory", back_populates="child")


class ChildPassport(Base):
    """
    Portable developmental identity — the single most important entity.
    Aggregates the child's full history across all domains.
    Follows the child across centre migrations.
    """
    __tablename__ = "child_passports"

    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id"), nullable=False, unique=True)
    passport_number = Column(String(50), unique=True, nullable=False, index=True)

    # Developmental summary (denormalised for fast passport reads)
    current_risk_level = Column(String(10), default="GREEN", nullable=False)
    current_risk_score = Column(String(10), default="0.0", nullable=False)
    total_attendance_sessions = Column(Integer, default=0, nullable=False)
    attended_sessions = Column(Integer, default=0, nullable=False)
    last_growth_recorded_at = Column(Date, nullable=True)
    last_assessment_at = Column(Date, nullable=True)
    active_referral_count = Column(Integer, default=0, nullable=False)
    notes = Column(Text, nullable=True)

    child = relationship("Child", back_populates="passport")


class MigrationHistory(Base):
    """Tracks every centre migration — ensures no child is lost in transition."""
    __tablename__ = "migration_history"

    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id"), nullable=False, index=True)
    from_centre_id = Column(UUID(as_uuid=True), ForeignKey("centres.id"), nullable=True)
    to_centre_id = Column(UUID(as_uuid=True), ForeignKey("centres.id"), nullable=False)
    migration_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=True)
    recorded_by = Column(UUID(as_uuid=True), nullable=True)

    child = relationship("Child", back_populates="migration_history")
    from_centre = relationship("Centre", foreign_keys=[from_centre_id])
    to_centre = relationship("Centre", foreign_keys=[to_centre_id])
