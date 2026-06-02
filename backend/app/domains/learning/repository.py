"""
Nila Arumbu — Learning Activity Repository
"""
from uuid import UUID

from app.domains.learning.models import LearningActivity
from app.repositories.base import BaseRepository


class LearningActivityRepository(BaseRepository[LearningActivity]):
    model = LearningActivity

    async def list_by_child(
        self, child_id: UUID, offset: int = 0, limit: int = 20
    ) -> tuple[list[LearningActivity], int]:
        return await self.list_all(
            offset=offset,
            limit=limit,
            filters=[LearningActivity.child_id == child_id],
        )
