"""
Nila Arumbu — Identity Repository
Persistence layer for User and Role entities.
"""
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.domains.identity.models import Role, User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    model = User

    async def get_by_email(self, email: str) -> User | None:
        result = await self.session.execute(
            select(User)
            .options(selectinload(User.role))
            .where(User.email == email, User.is_deleted == False)  # noqa: E712
        )
        return result.scalar_one_or_none()

    async def get_by_id_with_role(self, user_id: UUID) -> User | None:
        result = await self.session.execute(
            select(User)
            .options(selectinload(User.role))
            .where(User.id == user_id, User.is_deleted == False)  # noqa: E712
        )
        return result.scalar_one_or_none()

    async def email_exists(self, email: str) -> bool:
        result = await self.session.execute(
            select(User.id).where(User.email == email, User.is_deleted == False)  # noqa: E712
        )
        return result.scalar_one_or_none() is not None


class RoleRepository(BaseRepository[Role]):
    model = Role

    async def get_by_name(self, name: str) -> Role | None:
        result = await self.session.execute(
            select(Role).where(Role.name == name, Role.is_deleted == False)  # noqa: E712
        )
        return result.scalar_one_or_none()
