"""
Nila Arumbu — Notification Repository
"""
from uuid import UUID

from app.domains.notification.models import Notification
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    model = Notification

    async def list_by_recipient(
        self, recipient_id: UUID, offset: int = 0, limit: int = 30
    ) -> tuple[list[Notification], int]:
        return await self.list_all(
            offset=offset,
            limit=limit,
            filters=[Notification.recipient_id == recipient_id],
        )
