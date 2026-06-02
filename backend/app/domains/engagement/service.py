"""
Nila Arumbu — Parent Engagement Service
"""
import logging
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.engagement.models import ParentEngagementLog
from app.domains.engagement.repository import EngagementRepository
from app.domains.engagement.schemas import EngagementCreate

logger = logging.getLogger(__name__)


class EngagementService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = EngagementRepository(session)
        self.session = session

    async def log_engagement(
        self, data: EngagementCreate, actor_id: UUID | None = None
    ) -> ParentEngagementLog:
        log = ParentEngagementLog(
            child_id=data.child_id,
            parent_id=data.parent_id,
            engagement_type=data.engagement_type,
            channel=data.channel,
            message=data.message,
            extra_data=data.metadata,
            sent_by=actor_id,
            created_by=actor_id,
            updated_by=actor_id,
        )
        created = await self.repo.create(log)
        await self.session.commit()
        logger.info("Engagement logged: child=%s type=%s", data.child_id, data.engagement_type)
        return created

    async def list_by_child(
        self, child_id: UUID, offset: int, limit: int
    ) -> tuple[list[ParentEngagementLog], int]:
        return await self.repo.list_by_child(child_id, offset, limit)
