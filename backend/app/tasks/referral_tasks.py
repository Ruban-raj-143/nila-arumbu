"""
Nila Arumbu — Referral Escalation Tasks
Auto-escalate referrals that have been stuck in a state too long.
"""
import asyncio
import logging
from datetime import datetime, timedelta, UTC

from app.infrastructure.celery_app import celery_app

logger = logging.getLogger(__name__)

# Days before auto-escalation per state
ESCALATION_THRESHOLDS: dict[str, int] = {
    "IDENTIFIED":          3,   # 3 days without being referred
    "REFERRED":            7,   # 7 days without appointment
    "APPOINTMENT_PENDING": 5,   # 5 days without visit
    "VISITED":             14,  # 14 days without follow-up or closure
    "FOLLOWUP":            7,   # 7 days without resolution
}


@celery_app.task(name="app.tasks.referral_tasks.check_and_escalate_overdue_referrals")
def check_and_escalate_overdue_referrals() -> dict:
    """
    Hourly task — find referrals overdue for their current state
    and mark them as escalated with an auto-escalation reason.
    """
    async def _run():
        from sqlalchemy import select, update
        from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
        from app.core.config import settings
        from app.domains.referral.models import Referral

        engine = create_async_engine(settings.async_database_url)
        factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

        escalated_count = 0
        now = datetime.now(UTC)

        async with factory() as session:
            for state, threshold_days in ESCALATION_THRESHOLDS.items():
                cutoff = now - timedelta(days=threshold_days)
                result = await session.execute(
                    select(Referral).where(
                        Referral.status == state,
                        Referral.escalated == False,  # noqa: E712
                        Referral.updated_at < cutoff,
                        Referral.is_deleted == False,  # noqa: E712
                    )
                )
                overdue = result.scalars().all()

                for referral in overdue:
                    await session.execute(
                        update(Referral)
                        .where(Referral.id == referral.id)
                        .values(
                            escalated=True,
                            escalation_reason=(
                                f"Auto-escalated: stuck in '{state}' for "
                                f"more than {threshold_days} days."
                            ),
                        )
                    )
                    escalated_count += 1
                    logger.warning(
                        "Auto-escalated referral %s (state=%s, age>%dd)",
                        referral.id, state, threshold_days,
                    )

            await session.commit()

        return {"escalated": escalated_count}

    result = asyncio.run(_run())
    logger.info("Referral escalation check complete: %s", result)
    return result
