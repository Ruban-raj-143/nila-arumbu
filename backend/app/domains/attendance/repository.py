"""
Nila Arumbu — Attendance Repository
"""
from datetime import date
from uuid import UUID

from sqlalchemy import func, select

from app.domains.attendance.models import AttendanceRecord
from app.repositories.base import BaseRepository


class AttendanceRepository(BaseRepository[AttendanceRecord]):
    model = AttendanceRecord

    async def get_by_child_and_date(
        self, child_id: UUID, session_date: date
    ) -> AttendanceRecord | None:
        result = await self.session.execute(
            select(AttendanceRecord).where(
                AttendanceRecord.child_id == child_id,
                AttendanceRecord.session_date == session_date,
                AttendanceRecord.is_deleted == False,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def list_by_child(
        self, child_id: UUID, offset: int = 0, limit: int = 50
    ) -> tuple[list[AttendanceRecord], int]:
        return await self.list_all(
            offset=offset,
            limit=limit,
            filters=[AttendanceRecord.child_id == child_id],
        )

    async def get_summary(self, child_id: UUID) -> dict:
        """Returns attendance counts for a child — O(1) aggregation query."""
        result = await self.session.execute(
            select(
                AttendanceRecord.status,
                func.count(AttendanceRecord.id).label("count"),
            )
            .where(
                AttendanceRecord.child_id == child_id,
                AttendanceRecord.is_deleted == False,  # noqa: E712
            )
            .group_by(AttendanceRecord.status)
        )
        rows = result.all()
        # Build O(1) lookup map
        counts: dict[str, int] = {row.status: row.count for row in rows}
        total = sum(counts.values())
        attended = counts.get("PRESENT", 0)
        return {
            "total_sessions": total,
            "attended": attended,
            "absent": counts.get("ABSENT", 0),
            "excused": counts.get("EXCUSED", 0),
            "attendance_rate": round(attended / total * 100, 2) if total > 0 else 0.0,
        }
