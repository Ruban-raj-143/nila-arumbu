"""
Nila Arumbu — Notification Service
Persists notifications and dispatches via the Factory.
"""
import logging
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.notification.factory import NotificationFactory, NotificationPayload
from app.domains.notification.models import Notification
from app.domains.notification.repository import NotificationRepository
from app.domains.notification.schemas import NotificationCreate

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = NotificationRepository(session)
        self.session = session

    async def send(
        self,
        data: NotificationCreate,
        recipient_phone: str | None = None,
        recipient_email: str | None = None,
        actor_id: UUID | None = None,
    ) -> Notification:
        notification = Notification(
            recipient_id=data.recipient_id,
            child_id=data.child_id,
            channel=data.channel,
            notification_type=data.notification_type,
            title=data.title,
            body=data.body,
            payload=data.payload,
            status="PENDING",
            sent_by=actor_id,
            created_by=actor_id,
            updated_by=actor_id,
        )
        created = await self.repo.create(notification)

        # Dispatch via factory
        payload = NotificationPayload(
            recipient_phone=recipient_phone,
            recipient_email=recipient_email,
            title=data.title,
            body=data.body,
            extra=data.payload,
        )
        success = await NotificationFactory.dispatch(data.channel, payload)

        status = "SENT" if success else "FAILED"
        await self.repo.update_fields(created.id, {"status": status})
        await self.session.commit()

        logger.info("Notification %s via %s: %s", created.id, data.channel, status)
        return created

    async def list_for_recipient(
        self, recipient_id: UUID, offset: int, limit: int
    ) -> tuple[list[Notification], int]:
        return await self.repo.list_by_recipient(recipient_id, offset, limit)
