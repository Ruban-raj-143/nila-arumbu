"""
Nila Arumbu — Notification Tasks
Scheduled notification delivery via Celery.
"""
import asyncio
import logging

from app.infrastructure.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.notification_tasks.send_attendance_reminders")
def send_attendance_reminders() -> dict:
    """
    Daily task — send attendance recording reminders to all active workers.
    """
    async def _run():
        from sqlalchemy import select
        from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
        from app.core.config import settings
        from app.domains.identity.models import User, Role
        from app.domains.notification.factory import NotificationFactory, NotificationPayload

        engine = create_async_engine(settings.async_database_url)
        factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

        sent = 0
        async with factory() as session:
            result = await session.execute(
                select(User)
                .join(Role, User.role_id == Role.id)
                .where(
                    Role.name == "ANGANWADI_WORKER",
                    User.is_active == True,  # noqa: E712
                    User.is_deleted == False,  # noqa: E712
                )
            )
            workers = result.scalars().all()

            for worker in workers:
                if worker.phone:
                    payload = NotificationPayload(
                        recipient_phone=worker.phone,
                        title="Attendance Reminder",
                        body=(
                            f"நமஸ்காரம் {worker.full_name}! "
                            "இன்றைய குழந்தைகளின் வருகைப்பதிவை பதிவு செய்யவும். "
                            "Nila Arumbu — Every Child Seen."
                        ),
                    )
                    await NotificationFactory.dispatch("SMS", payload)
                    sent += 1

        return {"sent": sent}

    result = asyncio.run(_run())
    logger.info("Attendance reminders sent: %d", result.get("sent", 0))
    return result


@celery_app.task(
    name="app.tasks.notification_tasks.send_risk_alert",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
)
def send_risk_alert(self, child_id: str, risk_level: str, score: float) -> dict:
    """
    Triggered when a child's risk level changes to YELLOW or RED.
    Notifies the assigned worker and supervisor.
    """
    async def _run():
        from sqlalchemy import select
        from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
        from app.core.config import settings
        from app.domains.child.models import Child
        from app.domains.identity.models import User, Role
        from app.domains.notification.factory import NotificationFactory, NotificationPayload
        from uuid import UUID

        engine = create_async_engine(settings.async_database_url)
        factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

        async with factory() as session:
            child = await session.get(Child, UUID(child_id))
            if not child:
                return {"error": "child not found"}

            level_label = {"YELLOW": "Medium Risk ⚠️", "RED": "High Risk 🔴"}.get(risk_level, risk_level)
            message = (
                f"Risk Alert: Child {child.first_name} {child.last_name} "
                f"is now {level_label} (Score: {score:.0f}/100). "
                "Immediate action required."
            )

            # Notify workers in the same centre
            if child.centre_id:
                result = await session.execute(
                    select(User).where(
                        User.centre_id == child.centre_id,
                        User.is_active == True,  # noqa: E712
                    )
                )
                workers = result.scalars().all()
                for worker in workers:
                    if worker.phone:
                        await NotificationFactory.dispatch(
                            "SMS",
                            NotificationPayload(recipient_phone=worker.phone, title="Risk Alert", body=message),
                        )

        return {"child_id": child_id, "level": risk_level, "notified": True}

    try:
        return asyncio.run(_run())
    except Exception as exc:
        raise self.retry(exc=exc)
