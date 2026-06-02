"""
Nila Arumbu — Parent Engagement Repository
"""
from uuid import UUID

from app.domains.engagement.models import ParentEngagementLog
from app.repositories.base import BaseRepository


class EngagementRepository(BaseRepository[ParentEngagementLog]):
    model = ParentEngagementLog

    async def list_by_child(
        self, child_id: UUID, offset: int = 0, limit: int = 30
    ) -> tuple[list[ParentEngagementLog], int]:
        return await self.list_all(
            offset=offset,
            limit=limit,
            filters=[ParentEngagementLog.child_id == child_id],
        )
