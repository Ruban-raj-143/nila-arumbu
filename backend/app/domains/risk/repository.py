"""
Nila Arumbu — Risk Repository
"""
from uuid import UUID

from sqlalchemy import select

from app.domains.risk.models import RiskScore
from app.repositories.base import BaseRepository


class RiskScoreRepository(BaseRepository[RiskScore]):
    model = RiskScore

    async def list_by_child(
        self, child_id: UUID, offset: int = 0, limit: int = 20
    ) -> tuple[list[RiskScore], int]:
        return await self.list_all(
            offset=offset,
            limit=limit,
            filters=[RiskScore.child_id == child_id],
        )

    async def get_latest(self, child_id: UUID) -> RiskScore | None:
        result = await self.session.execute(
            select(RiskScore)
            .where(RiskScore.child_id == child_id, RiskScore.is_deleted == False)  # noqa: E712
            .order_by(RiskScore.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
