"""
Nila Arumbu — Learning Planner Domain Models
Activity plans generated based on age, risk, and developmental status.
"""
from sqlalchemy import Column, Date, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.infrastructure.database.base import Base


class LearningActivity(Base):
    """
    A generated activity plan for a child.
    Inputs: age, risk level, developmental status, referral outcomes.
    Outputs: centre activities + home activities + school readiness tasks.
    """
    __tablename__ = "learning_activities"

    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id"), nullable=False, index=True)
    plan_date = Column(Date, nullable=False, index=True)
    age_in_months = Column(String(10), nullable=False)
    risk_level = Column(String(10), nullable=False)           # GREEN | YELLOW | RED
    developmental_status = Column(String(30), nullable=False)

    # Activity lists stored as JSON arrays
    centre_activities = Column(JSON, nullable=False, default=list)
    home_activities = Column(JSON, nullable=False, default=list)
    school_readiness_tasks = Column(JSON, nullable=False, default=list)

    generated_by = Column(UUID(as_uuid=True), nullable=True)
    notes = Column(Text, nullable=True)

    child = relationship("Child")
