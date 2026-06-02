"""
Nila Arumbu — Referral Repository
"""
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.domains.referral.models import Referral, ReferralStatusLog
from app.repositories.base import BaseRepository


class ReferralRepository(BaseRepository[Referral]):
    model = Referral

    async def get_with_logs(self, referral_id: UUID) -> Referral | None:
        result = await self.session.execute(
            select(Referral)
            .options(selectinload(Referral.status_logs))
            .where(Referral.id == referral_id, Referral.is_deleted == False)  # noqa: E712
        )
        return result.scalar_one_or_none()

    async def list_by_child(
        self, child_id: UUID, offset: int = 0, limit: int = 20
    ) -> tuple[list[Referral], int]:
        return await self.list_all(
            offset=offset,
            limit=limit,
            filters=[Referral.child_id == child_id],
        )

    async def list_by_status(
        self, status: str, offset: int = 0, limit: int = 50
    ) -> tuple[list[Referral], int]:
        return await self.list_all(
            offset=offset,
            limit=limit,
            filters=[Referral.status == status],
        )


class ReferralStatusLogRepository(BaseRepository[ReferralStatusLog]):
    model = ReferralStatusLog
