"""
Nila Arumbu — Referral Service
Orchestrates referral lifecycle with state machine enforcement.
"""
import logging
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.domains.referral.models import Referral, ReferralStatusLog
from app.domains.referral.repository import ReferralRepository, ReferralStatusLogRepository
from app.domains.referral.schemas import EscalateRequest, ReferralCreate, ReferralTransition
from app.domains.referral.state_machine import get_allowed_transitions, validate_transition

logger = logging.getLogger(__name__)


class ReferralService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = ReferralRepository(session)
        self.log_repo = ReferralStatusLogRepository(session)
        self.session = session

    async def create_referral(
        self, data: ReferralCreate, actor_id: UUID | None = None
    ) -> Referral:
        referral = Referral(
            child_id=data.child_id,
            reason=data.reason,
            referral_type=data.referral_type,
            referred_to=data.referred_to,
            notes=data.notes,
            status="IDENTIFIED",
            created_by=actor_id,
            updated_by=actor_id,
        )
        created = await self.repo.create(referral)

        # Initial status log entry
        log = ReferralStatusLog(
            referral_id=created.id,
            from_status=None,
            to_status="IDENTIFIED",
            changed_by=actor_id,
            notes="Referral created.",
            created_by=actor_id,
        )
        await self.log_repo.create(log)
        await self.session.commit()

        logger.info("Referral created: %s for child %s", created.id, data.child_id)
        return created

    async def transition(
        self, referral_id: UUID, data: ReferralTransition, actor_id: UUID | None = None
    ) -> Referral:
        referral = await self.repo.get_with_logs(referral_id)
        if not referral:
            raise NotFoundError(f"Referral {referral_id} not found.")

        # State machine validates — raises InvalidStateTransitionError on failure
        validate_transition(referral.status, data.target_state)

        old_status = referral.status
        await self.repo.update_fields(
            referral_id,
            {"status": data.target_state, "updated_by": actor_id},
        )

        log = ReferralStatusLog(
            referral_id=referral_id,
            from_status=old_status,
            to_status=data.target_state,
            changed_by=actor_id,
            notes=data.notes,
            created_by=actor_id,
        )
        await self.log_repo.create(log)
        await self.session.commit()

        logger.info("Referral %s: %s → %s", referral_id, old_status, data.target_state)
        return await self.repo.get_with_logs(referral_id)  # type: ignore[return-value]

    async def escalate(
        self, referral_id: UUID, data: EscalateRequest, actor_id: UUID | None = None
    ) -> Referral:
        referral = await self.repo.get_by_id(referral_id)
        if not referral:
            raise NotFoundError(f"Referral {referral_id} not found.")

        await self.repo.update_fields(
            referral_id,
            {"escalated": True, "escalation_reason": data.reason, "updated_by": actor_id},
        )
        await self.session.commit()
        return await self.repo.get_with_logs(referral_id)  # type: ignore[return-value]

    async def get_referral(self, referral_id: UUID) -> Referral:
        referral = await self.repo.get_with_logs(referral_id)
        if not referral:
            raise NotFoundError(f"Referral {referral_id} not found.")
        return referral

    async def list_by_child(
        self, child_id: UUID, offset: int, limit: int
    ) -> tuple[list[Referral], int]:
        return await self.repo.list_by_child(child_id, offset, limit)

    async def list_by_status(
        self, status: str, offset: int, limit: int
    ) -> tuple[list[Referral], int]:
        return await self.repo.list_by_status(status, offset, limit)
