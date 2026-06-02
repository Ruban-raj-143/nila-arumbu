"""
Nila Arumbu — Development Assessment Repository
"""
from uuid import UUID

from sqlalchemy import select

from app.domains.development.models import DevelopmentAssessment
from app.repositories.base import BaseRepository


class DevelopmentAssessmentRepository(BaseRepository[DevelopmentAssessment]):
    model = DevelopmentAssessment

    async def list_by_child(
        self, child_id: UUID, offset: int = 0, limit: int = 20
    ) -> tuple[list[DevelopmentAssessment], int]:
        return await self.list_all(
            offset=offset,
            limit=limit,
            filters=[DevelopmentAssessment.child_id == child_id],
        )

    async def get_latest(self, child_id: UUID) -> DevelopmentAssessment | None:
        result = await self.session.execute(
            select(DevelopmentAssessment)
            .where(
                DevelopmentAssessment.child_id == child_id,
                DevelopmentAssessment.is_deleted == False,  # noqa: E712
            )
            .order_by(DevelopmentAssessment.assessed_date.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
