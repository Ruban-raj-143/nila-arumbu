"""
Nila Arumbu — Child Service
Orchestrates child registration, passport management, and migration.
"""
import logging
import uuid
from datetime import date
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.domains.child.models import Child, ChildPassport, MigrationHistory
from app.domains.child.repository import (
    ChildPassportRepository,
    ChildRepository,
    MigrationHistoryRepository,
)
from app.domains.child.schemas import ChildCreate, ChildUpdate, MigrationCreate

logger = logging.getLogger(__name__)


def _generate_passport_number() -> str:
    """Generates a unique passport number: NA-XXXXXXXX."""
    return f"NA-{uuid.uuid4().hex[:8].upper()}"


class ChildService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = ChildRepository(session)
        self.passport_repo = ChildPassportRepository(session)
        self.migration_repo = MigrationHistoryRepository(session)
        self.session = session

    # ── Registration ──────────────────────────────────────────────────────────

    async def register_child(self, data: ChildCreate, actor_id: UUID | None = None) -> Child:
        # Prevent duplicate Aadhaar registration
        if data.aadhaar_number:
            existing = await self.repo.get_by_aadhaar(data.aadhaar_number)
            if existing:
                raise ConflictError(
                    f"A child with Aadhaar '{data.aadhaar_number}' is already registered."
                )

        child = Child(
            first_name=data.first_name,
            last_name=data.last_name,
            date_of_birth=data.date_of_birth,
            gender=data.gender,
            aadhaar_number=data.aadhaar_number,
            mother_name=data.mother_name,
            father_name=data.father_name,
            guardian_name=data.guardian_name,
            guardian_phone=data.guardian_phone,
            address=data.address,
            centre_id=data.centre_id,
            created_by=actor_id,
            updated_by=actor_id,
        )
        created = await self.repo.create(child)

        # Auto-create passport on registration
        passport = ChildPassport(
            child_id=created.id,
            passport_number=_generate_passport_number(),
            created_by=actor_id,
            updated_by=actor_id,
        )
        await self.passport_repo.create(passport)
        await self.session.commit()

        logger.info("Child registered: %s (passport auto-created)", created.id)
        return created

    # ── Read ──────────────────────────────────────────────────────────────────

    async def get_child(self, child_id: UUID) -> Child:
        child = await self.repo.get_with_passport(child_id)
        if not child:
            raise NotFoundError(f"Child {child_id} not found.")
        return child

    async def get_passport(self, child_id: UUID) -> ChildPassport:
        passport = await self.passport_repo.get_by_child_id(child_id)
        if not passport:
            raise NotFoundError(f"Passport for child {child_id} not found.")
        return passport

    async def list_children(
        self, offset: int, limit: int, centre_id: UUID | None = None
    ) -> tuple[list[Child], int]:
        if centre_id:
            return await self.repo.list_by_centre(centre_id, offset, limit)
        return await self.repo.list_all(offset=offset, limit=limit)

    # ── Update ────────────────────────────────────────────────────────────────

    async def update_child(self, child_id: UUID, data: ChildUpdate, actor_id: UUID) -> Child:
        child = await self.repo.get_by_id(child_id)
        if not child:
            raise NotFoundError(f"Child {child_id} not found.")
        updates = data.model_dump(exclude_none=True)
        updates["updated_by"] = actor_id
        updated = await self.repo.update_fields(child_id, updates)
        await self.session.commit()
        return updated  # type: ignore[return-value]

    # ── Migration ─────────────────────────────────────────────────────────────

    async def migrate_child(self, data: MigrationCreate, actor_id: UUID) -> MigrationHistory:
        child = await self.repo.get_by_id(data.child_id)
        if not child:
            raise NotFoundError(f"Child {data.child_id} not found.")

        migration = MigrationHistory(
            child_id=data.child_id,
            from_centre_id=child.centre_id,
            to_centre_id=data.to_centre_id,
            migration_date=data.migration_date,
            reason=data.reason,
            recorded_by=actor_id,
            created_by=actor_id,
        )
        created = await self.migration_repo.create(migration)

        # Update child's current centre
        await self.repo.update_fields(
            data.child_id,
            {"centre_id": data.to_centre_id, "updated_by": actor_id},
        )
        await self.session.commit()

        logger.info(
            "Child %s migrated from %s to %s",
            data.child_id, child.centre_id, data.to_centre_id,
        )
        return created

    async def get_migration_history(self, child_id: UUID) -> list[MigrationHistory]:
        return await self.migration_repo.list_by_child(child_id)
