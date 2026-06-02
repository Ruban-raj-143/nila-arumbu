"""
Nila Arumbu — Child Repository
"""
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.domains.child.models import Centre, Child, ChildPassport, MigrationHistory
from app.repositories.base import BaseRepository


class CentreRepository(BaseRepository[Centre]):
    model = Centre

    async def get_by_code(self, code: str) -> Centre | None:
        result = await self.session.execute(
            select(Centre).where(Centre.code == code, Centre.is_deleted == False)  # noqa: E712
        )
        return result.scalar_one_or_none()


class ChildRepository(BaseRepository[Child]):
    model = Child

    async def get_with_passport(self, child_id: UUID) -> Child | None:
        result = await self.session.execute(
            select(Child)
            .options(selectinload(Child.passport), selectinload(Child.centre))
            .where(Child.id == child_id, Child.is_deleted == False)  # noqa: E712
        )
        return result.scalar_one_or_none()

    async def get_by_aadhaar(self, aadhaar: str) -> Child | None:
        result = await self.session.execute(
            select(Child).where(Child.aadhaar_number == aadhaar, Child.is_deleted == False)  # noqa: E712
        )
        return result.scalar_one_or_none()

    async def list_by_centre(self, centre_id: UUID, offset: int, limit: int) -> tuple[list[Child], int]:
        from sqlalchemy import func
        filters = [Child.centre_id == centre_id]
        return await self.list_all(offset=offset, limit=limit, filters=filters)


class ChildPassportRepository(BaseRepository[ChildPassport]):
    model = ChildPassport

    async def get_by_child_id(self, child_id: UUID) -> ChildPassport | None:
        result = await self.session.execute(
            select(ChildPassport).where(
                ChildPassport.child_id == child_id,
                ChildPassport.is_deleted == False,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()


class MigrationHistoryRepository(BaseRepository[MigrationHistory]):
    model = MigrationHistory

    async def list_by_child(self, child_id: UUID) -> list[MigrationHistory]:
        result = await self.session.execute(
            select(MigrationHistory)
            .where(MigrationHistory.child_id == child_id)
            .order_by(MigrationHistory.migration_date.desc())
        )
        return list(result.scalars().all())
