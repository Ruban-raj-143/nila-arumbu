"""
Nila Arumbu — Growth Repository
"""
from uuid import UUID

from sqlalchemy import select

from app.domains.growth.models import GrowthRecord
from app.repositories.base import BaseRepository


class GrowthRepository(BaseRepository[GrowthRecord]):
    model = GrowthRecord

    async def list_by_child(
        self, child_id: UUID, offset: int = 0, limit: int = 50
    ) -> tuple[list[GrowthRecord], int]:
        return await self.list_all(
            offset=offset,
            limit=limit,
            filters=[GrowthRecord.child_id == child_id],
        )

    async def get_latest(self, child_id: UUID) -> GrowthRecord | None:
        result = await self.session.execute(
            select(GrowthRecord)
            .where(GrowthRecord.child_id == child_id, GrowthRecord.is_deleted == False)  # noqa: E712
            .order_by(GrowthRecord.recorded_date.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
