"""
Nila Arumbu — Risk Domain Models
Explainable risk scores with full factor breakdown.
"""
from sqlalchemy import Column, Float, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.infrastructure.database.base import Base


class RiskScore(Base):
    __tablename__ = "risk_scores"

    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id"), nullable=False, index=True)

    # Aggregated score
    total_score = Column(Float, nullable=False, default=0.0)
    risk_level = Column(String(10), nullable=False, default="GREEN")  # GREEN | YELLOW | RED

    # Component scores (Strategy Pattern output)
    attendance_score = Column(Float, nullable=False, default=0.0)
    nutrition_score = Column(Float, nullable=False, default=0.0)
    development_score = Column(Float, nullable=False, default=0.0)
    caregiver_score = Column(Float, nullable=False, default=0.0)
    migration_score = Column(Float, nullable=False, default=0.0)

    # Explainability — no black box
    contributing_factors = Column(JSON, nullable=False, default=list)
    weight_breakdown = Column(JSON, nullable=False, default=dict)
    explanation = Column(Text, nullable=False, default="")

    calculated_by = Column(UUID(as_uuid=True), nullable=True)

    child = relationship("Child", back_populates="risk_scores")
