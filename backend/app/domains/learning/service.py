"""
Nila Arumbu — Learning Planner Service
"""
import logging
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.learning.models import LearningActivity
from app.domains.learning.planner import PlanInput, learning_planner
from app.domains.learning.repository import LearningActivityRepository
from app.domains.learning.schemas import LearningPlanRequest

logger = logging.getLogger(__name__)


class LearningService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = LearningActivityRepository(session)
        self.session = session

    async def generate_plan(
        self, data: LearningPlanRequest, actor_id: UUID | None = None
    ) -> LearningActivity:
        plan_input = PlanInput(
            child_id=str(data.child_id),
            age_in_months=data.age_in_months,
            risk_level=data.risk_level,
            developmental_status=data.developmental_status,
            referral_outcome=data.referral_outcome,
        )
        plan = learning_planner.generate(plan_input)

        activity = LearningActivity(
            child_id=data.child_id,
            plan_date=data.plan_date,
            age_in_months=str(data.age_in_months),
            risk_level=data.risk_level,
            developmental_status=data.developmental_status,
            centre_activities=plan.centre_activities,
            home_activities=plan.home_activities,
            school_readiness_tasks=plan.school_readiness_tasks,
            notes=data.notes,
            generated_by=actor_id,
            created_by=actor_id,
            updated_by=actor_id,
        )
        created = await self.repo.create(activity)
        await self.session.commit()
        logger.info("Learning plan generated: child=%s risk=%s", data.child_id, data.risk_level)
        return created

    async def list_plans(
        self, child_id: UUID, offset: int, limit: int
    ) -> tuple[list[LearningActivity], int]:
        return await self.repo.list_by_child(child_id, offset, limit)
