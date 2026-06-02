"""
Nila Arumbu — Development Assessment Service
Computes overall milestone score and developmental status classification.
"""
import logging
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.domains.development.models import DevelopmentAssessment
from app.domains.development.repository import DevelopmentAssessmentRepository
from app.domains.development.schemas import AssessmentCreate, DevelopmentSummary

logger = logging.getLogger(__name__)

# O(1) status classification map — thresholds based on ICDS guidelines
_STATUS_MAP: list[tuple[float, str]] = [
    (80.0, "ON_TRACK"),
    (60.0, "MILD_DELAY"),
    (40.0, "MODERATE_DELAY"),
    (0.0, "SEVERE_DELAY"),
]


def _classify_status(score: float) -> str:
    for threshold, status in _STATUS_MAP:
        if score >= threshold:
            return status
    return "SEVERE_DELAY"


def _compute_overall(data: AssessmentCreate) -> float:
    """Weighted average across five developmental domains."""
    weights = {
        "gross_motor": 0.20,
        "fine_motor": 0.20,
        "language": 0.25,
        "cognitive": 0.20,
        "social_emotional": 0.15,
    }
    return round(
        data.gross_motor_score * weights["gross_motor"]
        + data.fine_motor_score * weights["fine_motor"]
        + data.language_score * weights["language"]
        + data.cognitive_score * weights["cognitive"]
        + data.social_emotional_score * weights["social_emotional"],
        2,
    )


class DevelopmentService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = DevelopmentAssessmentRepository(session)
        self.session = session

    async def record_assessment(
        self, data: AssessmentCreate, actor_id: UUID | None = None
    ) -> DevelopmentAssessment:
        overall = _compute_overall(data)
        status = _classify_status(overall)

        assessment = DevelopmentAssessment(
            child_id=data.child_id,
            assessed_date=data.assessed_date,
            age_in_months=data.age_in_months,
            gross_motor_score=data.gross_motor_score,
            fine_motor_score=data.fine_motor_score,
            language_score=data.language_score,
            cognitive_score=data.cognitive_score,
            social_emotional_score=data.social_emotional_score,
            overall_milestone_score=overall,
            developmental_status=status,
            milestones=[m.model_dump() for m in data.milestones],
            notes=data.notes,
            assessed_by=actor_id,
            created_by=actor_id,
            updated_by=actor_id,
        )
        created = await self.repo.create(assessment)
        await self.session.commit()
        logger.info("Assessment recorded: child=%s status=%s score=%.1f", data.child_id, status, overall)
        return created

    async def get_summary(self, child_id: UUID) -> DevelopmentSummary:
        records, count = await self.repo.list_by_child(child_id, limit=10)
        if not records:
            return DevelopmentSummary(
                child_id=child_id,
                latest_status=None,
                latest_overall_score=None,
                assessment_count=0,
                trend="INSUFFICIENT_DATA",
            )
        latest = records[0]
        trend = _compute_trend(records)
        return DevelopmentSummary(
            child_id=child_id,
            latest_status=latest.developmental_status,
            latest_overall_score=latest.overall_milestone_score,
            assessment_count=count,
            trend=trend,
        )

    async def list_assessments(
        self, child_id: UUID, offset: int, limit: int
    ) -> tuple[list[DevelopmentAssessment], int]:
        return await self.repo.list_by_child(child_id, offset, limit)


def _compute_trend(records: list[DevelopmentAssessment]) -> str:
    if len(records) < 2:
        return "INSUFFICIENT_DATA"
    delta = records[0].overall_milestone_score - records[1].overall_milestone_score
    if delta > 3:
        return "IMPROVING"
    if delta < -3:
        return "DECLINING"
    return "STABLE"
