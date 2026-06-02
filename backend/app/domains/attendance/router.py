"""
Nila Arumbu — Attendance Router
"""
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NilaBaseError
from app.core.pagination import PageParams, PagedResponse
from app.core.security import TokenPayload, get_current_token
from app.domains.attendance.schemas import AttendanceCreate, AttendanceRead, AttendanceSummary
from app.domains.attendance.service import AttendanceService
from app.infrastructure.database.session import get_db

router = APIRouter(prefix="/attendance", tags=["Attendance"])


def _svc(db: AsyncSession = Depends(get_db)) -> AttendanceService:
    return AttendanceService(db)


@router.post("/", response_model=AttendanceRead, status_code=status.HTTP_201_CREATED)
async def record_attendance(
    body: AttendanceCreate,
    token: TokenPayload = Depends(get_current_token),
    svc: AttendanceService = Depends(_svc),
) -> AttendanceRead:
    try:
        record = await svc.record_attendance(body, actor_id=UUID(token.sub))
        return AttendanceRead.model_validate(record)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.get("/children/{child_id}", response_model=PagedResponse[AttendanceRead])
async def get_child_attendance(
    child_id: UUID,
    page_params: PageParams = Depends(),
    token: TokenPayload = Depends(get_current_token),
    svc: AttendanceService = Depends(_svc),
) -> PagedResponse[AttendanceRead]:
    records, total = await svc.get_child_attendance(child_id, page_params.offset, page_params.size)
    return PagedResponse.build(
        items=[AttendanceRead.model_validate(r) for r in records],
        total=total,
        params=page_params,
    )


@router.get("/children/{child_id}/summary", response_model=AttendanceSummary)
async def get_attendance_summary(
    child_id: UUID,
    token: TokenPayload = Depends(get_current_token),
    svc: AttendanceService = Depends(_svc),
) -> AttendanceSummary:
    return await svc.get_attendance_summary(child_id)
