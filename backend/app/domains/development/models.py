"""
Nila Arumbu — Development Assessment Domain Models
Tracks milestone completion across developmental domains.
"""
from sqlalchemy import Column, Date, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.infrastructure.database.base import Base


class DevelopmentAssessment(Base):
    """
    Periodic developmental assessment for a child.
    Covers five WHO/ICDS developmental domains.
    """
    __tablename__ = "development_assessments"

    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id"), nullable=False, index=True)
    assessed_date = Column(Date, nullable=False, index=True)
    age_in_months = Column(Integer, nullable=False)

    # Domain scores (0–100 each)
    gross_motor_score = Column(Float, nullable=False, default=0.0)
    fine_motor_score = Column(Float, nullable=False, default=0.0)
    language_score = Column(Float, nullable=False, default=0.0)
    cognitive_score = Column(Float, nullable=False, default=0.0)
    social_emotional_score = Column(Float, nullable=False, default=0.0)

    # Aggregated milestone score (used by Risk Engine)
    overall_milestone_score = Column(Float, nullable=False, default=0.0)

    # Milestone detail — JSON list of {milestone_id, domain, description, achieved}
    milestones = Column(JSON, nullable=False, default=list)

    # Classification: ON_TRACK | MILD_DELAY | MODERATE_DELAY | SEVERE_DELAY
    developmental_status = Column(String(30), nullable=False, default="ON_TRACK")

    assessed_by = Column(UUID(as_uuid=True), nullable=True)
    notes = Column(Text, nullable=True)

    child = relationship("Child")
