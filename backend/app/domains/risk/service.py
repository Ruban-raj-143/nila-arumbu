"""
Nila Arumbu — Risk Service
Persists risk scores and exposes history.
"""
import logging
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.domains.risk.engine import ChildRiskContext, risk_engine
from app.domains.risk.models import RiskScore
from app.domains.risk.repository import RiskScoreRepository
from app.domains.risk.schemas import RiskInput

logger = logging.getLogger(__name__)


class RiskService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = RiskScoreRepository(session)
        self.session = session

    async def calculate_and_persist(
        self, data: RiskInput, actor_id: UUID | None = None
    ) -> RiskScore:
        ctx = ChildRiskContext(
            child_id=str(data.child_id),
            total_sessions=data.total_sessions,
            attended_sessions=data.attended_sessions,
            weight_for_age_z=data.weight_for_age_z,
            height_for_age_z=data.height_for_age_z,
            muac_cm=data.muac_cm,
            development_milestone_score=data.development_milestone_score,
            primary_caregiver_present=data.primary_caregiver_present,
            caregiver_literate=data.caregiver_literate,
            household_income_below_poverty=data.household_income_below_poverty,
            has_migrated_in_last_6_months=data.has_migrated_in_last_6_months,
            migration_count_last_year=data.migration_count_last_year,
        )
        output = risk_engine.calculate(ctx)

        score = RiskScore(
            child_id=data.child_id,
            total_score=output.total_score,
            risk_level=output.risk_level,
            attendance_score=output.component_scores.get("AttendanceRisk", 0.0),
            nutrition_score=output.component_scores.get("NutritionRisk", 0.0),
            development_score=output.component_scores.get("DevelopmentRisk", 0.0),
            caregiver_score=output.component_scores.get("CaregiverRisk", 0.0),
            migration_score=output.component_scores.get("MigrationRisk", 0.0),
            contributing_factors=output.contributing_factors,
            weight_breakdown=output.weight_breakdown,
            explanation=output.explanation,
            calculated_by=actor_id,
            created_by=actor_id,
            updated_by=actor_id,
        )
        created = await self.repo.create(score)
        await self.session.commit()
        return created

    async def get_latest(self, child_id: UUID) -> RiskScore:
        score = await self.repo.get_latest(child_id)
        if not score:
            raise NotFoundError(f"No risk score found for child {child_id}.")
        return score

    async def get_history(
        self, child_id: UUID, offset: int, limit: int
    ) -> tuple[list[RiskScore], int]:
        return await self.repo.list_by_child(child_id, offset, limit)
