"""
Nila Arumbu — Generic Async Repository
Provides standard CRUD operations. Domain repositories extend this class.
"""
from typing import Any, Generic, TypeVar
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    model: type[ModelT]

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # ── Read ──────────────────────────────────────────────────────────────────

    async def get_by_id(self, record_id: UUID) -> ModelT | None:
        result = await self.session.execute(
            select(self.model).where(
                self.model.id == record_id,
                self.model.is_deleted == False,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def list_all(
        self,
        offset: int = 0,
        limit: int = 20,
        filters: list[Any] | None = None,
    ) -> tuple[list[ModelT], int]:
        base_where = [self.model.is_deleted == False]  # noqa: E712
        if filters:
            base_where.extend(filters)

        count_q = select(func.count()).select_from(self.model).where(*base_where)
        total: int = (await self.session.execute(count_q)).scalar_one()

        rows_q = (
            select(self.model)
            .where(*base_where)
            .order_by(self.model.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        rows = (await self.session.execute(rows_q)).scalars().all()
        return list(rows), total

    # ── Write ─────────────────────────────────────────────────────────────────

    async def create(self, instance: ModelT) -> ModelT:
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def update_fields(self, record_id: UUID, data: dict[str, Any]) -> ModelT | None:
        await self.session.execute(
            update(self.model)
            .where(self.model.id == record_id)
            .values(**data)
        )
        await self.session.flush()
        return await self.get_by_id(record_id)

    async def soft_delete(self, record_id: UUID, deleted_by: UUID | None = None) -> bool:
        values: dict[str, Any] = {"is_deleted": True}
        if deleted_by:
            values["updated_by"] = deleted_by
        result = await self.session.execute(
            update(self.model)
            .where(self.model.id == record_id)
            .values(**values)
        )
        await self.session.flush()
        return result.rowcount > 0
