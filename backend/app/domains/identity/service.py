"""
Nila Arumbu — Identity Service
Orchestrates authentication and user management business logic.
"""
import logging
from datetime import timedelta
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.domains.identity.models import User
from app.domains.identity.repository import UserRepository
from app.domains.identity.schemas import (
    LoginRequest,
    PasswordChangeRequest,
    TokenResponse,
    UserCreate,
    UserUpdate,
)

logger = logging.getLogger(__name__)


class IdentityService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = UserRepository(session)
        self.session = session

    # ── Registration ──────────────────────────────────────────────────────────

    async def register_user(self, data: UserCreate, actor_id: UUID | None = None) -> User:
        if await self.repo.email_exists(data.email):
            raise ConflictError(f"Email '{data.email}' is already registered.")

        user = User(
            email=data.email,
            phone=data.phone,
            full_name=data.full_name,
            hashed_password=hash_password(data.password),
            role_id=data.role_id,
            centre_id=data.centre_id,
            created_by=actor_id,
            updated_by=actor_id,
        )
        created = await self.repo.create(user)
        await self.session.commit()
        logger.info("User registered: %s", created.email)
        return created

    # ── Authentication ────────────────────────────────────────────────────────

    async def login(self, data: LoginRequest) -> TokenResponse:
        user = await self.repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise ForbiddenError("Invalid email or password.")
        if not user.is_active:
            raise ForbiddenError("Account is deactivated. Contact your supervisor.")

        role_name = user.role.name if user.role else "UNKNOWN"
        access_token = create_access_token(str(user.id), role_name)
        refresh_token = create_refresh_token(str(user.id), role_name)

        logger.info("User logged in: %s", user.email)
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        user = await self.repo.get_by_id_with_role(UUID(payload.sub))
        if not user or not user.is_active:
            raise ForbiddenError("User not found or inactive.")

        role_name = user.role.name if user.role else "UNKNOWN"
        access_token = create_access_token(str(user.id), role_name)
        new_refresh = create_refresh_token(str(user.id), role_name)
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    # ── Profile ───────────────────────────────────────────────────────────────

    async def get_user(self, user_id: UUID) -> User:
        user = await self.repo.get_by_id_with_role(user_id)
        if not user:
            raise NotFoundError(f"User {user_id} not found.")
        return user

    async def update_user(self, user_id: UUID, data: UserUpdate, actor_id: UUID) -> User:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundError(f"User {user_id} not found.")

        updates = data.model_dump(exclude_none=True)
        updates["updated_by"] = actor_id
        updated = await self.repo.update_fields(user_id, updates)
        await self.session.commit()
        return updated  # type: ignore[return-value]

    async def change_password(
        self, user_id: UUID, data: PasswordChangeRequest
    ) -> None:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundError(f"User {user_id} not found.")
        if not verify_password(data.current_password, user.hashed_password):
            raise ForbiddenError("Current password is incorrect.")

        await self.repo.update_fields(
            user_id,
            {"hashed_password": hash_password(data.new_password), "updated_by": user_id},
        )
        await self.session.commit()
