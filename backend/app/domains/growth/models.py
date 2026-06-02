"""
Nila Arumbu — Growth Domain Models
"""
from sqlalchemy import Column, Date, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.infrastructure.database.base import Base


class GrowthRecord(Base):
    __tablename__ = "growth_records"

    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id"), nullable=False, index=True)
    recorded_date = Column(Date, nullable=False, index=True)

    # Anthropometric measurements
    weight_kg = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    muac_cm = Column(Float, nullable=True)   # Mid-Upper Arm Circumference

    # WHO Z-scores (computed at record time)
    weight_for_age_z = Column(Float, nullable=True)
    height_for_age_z = Column(Float, nullable=True)
    weight_for_height_z = Column(Float, nullable=True)

    # Classification
    nutrition_status = Column(String(50), nullable=True)
    # SAM | MAM | NORMAL | OVERWEIGHT | STUNTED | WASTED

    recorded_by = Column(UUID(as_uuid=True), nullable=True)
    notes = Column(Text, nullable=True)

    child = relationship("Child", back_populates="growth_records")
