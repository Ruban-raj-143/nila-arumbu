"""
Nila Arumbu — Attendance Service
"""
import logging
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.domains.attendance.models import AttendanceRecord
from app.domains.attendance.repository import AttendanceRepository
from app.domains.attendance.schemas import AttendanceCreate, AttendanceSummary

logger = logging.getLogger(__name__)


class AttendanceService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = AttendanceRepository(session)
        self.session = session

    async def record_attendance(
        self, data: AttendanceCreate, actor_id: UUID | None = None
    ) -> AttendanceRecord:
        existing = await self.repo.get_by_child_and_date(data.child_id, data.session_date)
        if existing:
            raise ConflictError(
                f"Attendance for child {data.child_id} on {data.session_date} already recorded."
            )

        record = AttendanceRecord(
            child_id=data.child_id,
            centre_id=data.centre_id,
            session_date=data.session_date,
            status=data.status,
            notes=data.notes,
            recorded_by=actor_id,
            created_by=actor_id,
            updated_by=actor_id,
        )
        created = await self.repo.create(record)
        await self.session.commit()
        logger.info("Attendance recorded: child=%s date=%s status=%s", data.child_id, data.session_date, data.status)
        return created

    async def get_child_attendance(
        self, child_id: UUID, offset: int, limit: int
    ) -> tuple[list[AttendanceRecord], int]:
        return await self.repo.list_by_child(child_id, offset, limit)

    async def get_attendance_summary(self, child_id: UUID) -> AttendanceSummary:
        summary = await self.repo.get_summary(child_id)
        return AttendanceSummary(child_id=child_id, **summary)
