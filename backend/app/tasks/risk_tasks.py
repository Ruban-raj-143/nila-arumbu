"""
Nila Arumbu — Risk Recalculation Tasks
Celery tasks for background risk score computation.
"""
import logging
from uuid import UUID

from app.infrastructure.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(
    name="app.tasks.risk_tasks.recalculate_risk_for_child",
    bind=True,
    max_retries=3,
    default_retry_delay=60,
)
def recalculate_risk_for_child(self, child_id: str) -> dict:
    """
    Recalculate risk score for a single child.
    Pulls latest attendance, growth, and development data.
    """
    import asyncio
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
    from app.core.config import settings
    from app.domains.risk.service import RiskService
    from app.domains.risk.schemas import RiskInput
    from app.domains.attendance.repository import AttendanceRepository
    from app.domains.growth.repository import GrowthRepository
    from app.domains.development.repository import DevelopmentAssessmentRepository
    from app.domains.child.repository import MigrationHistoryRepository

    async def _run():
        engine = create_async_engine(settings.async_database_url)
        factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        async with factory() as session:
            child_uuid = UUID(child_id)

            # Gather inputs from latest records
            att_repo = AttendanceRepository(session)
            att_summary = await att_repo.get_summary(child_uuid)

            growth_repo = GrowthRepository(session)
            latest_growth = await growth_repo.get_latest(child_uuid)

            dev_repo = DevelopmentAssessmentRepository(session)
            latest_dev = await dev_repo.get_latest(child_uuid)

            mig_repo = MigrationHistoryRepository(session)
            migrations = await mig_repo.list_by_child(child_uuid)

            from datetime import date, timedelta
            recent_migrations = [
                m for m in migrations
                if m.migration_date >= date.today() - timedelta(days=180)
            ]

            risk_input = RiskInput(
                child_id=child_uuid,
                total_sessions=att_summary.get("total_sessions", 0),
                attended_sessions=att_summary.get("attended", 0),
                weight_for_age_z=latest_growth.weight_for_age_z if latest_growth else 0.0,
                height_for_age_z=latest_growth.height_for_age_z if latest_growth else 0.0,
                muac_cm=latest_growth.muac_cm if latest_growth and latest_growth.muac_cm else 15.0,
                development_milestone_score=(
                    latest_dev.overall_milestone_score if latest_dev else 100.0
                ),
                has_migrated_in_last_6_months=len(recent_migrations) > 0,
                migration_count_last_year=len(migrations),
            )

            svc = RiskService(session)
            score = await svc.calculate_and_persist(risk_input)
            logger.info("Risk recalculated: child=%s score=%.1f level=%s",
                        child_id, score.total_score, score.risk_level)
            return {"child_id": child_id, "score": score.total_score, "level": score.risk_level}

    try:
        return asyncio.run(_run())
    except Exception as exc:
        logger.error("Risk recalculation failed for child=%s: %s", child_id, exc)
        raise self.retry(exc=exc)


@celery_app.task(name="app.tasks.risk_tasks.recalculate_all_risk_scores")
def recalculate_all_risk_scores() -> dict:
    """Daily task — recalculate risk for all active children."""
    import asyncio
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
    from app.core.config import settings
    from app.domains.child.repository import ChildRepository

    async def _get_children():
        engine = create_async_engine(settings.async_database_url)
        factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        async with factory() as session:
            repo = ChildRepository(session)
            children, total = await repo.list_all(limit=10000)
            return [str(c.id) for c in children], total

    child_ids, total = asyncio.run(_get_children())

    # Dispatch individual tasks
    for child_id in child_ids:
        recalculate_risk_for_child.delay(child_id)

    logger.info("Dispatched risk recalculation for %d children", total)
    return {"dispatched": total}
