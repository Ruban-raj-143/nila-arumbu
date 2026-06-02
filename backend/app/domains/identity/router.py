"""
Nila Arumbu — Identity Router
Auth endpoints: register, login, refresh, profile, password change.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NilaBaseError
from app.core.security import TokenPayload, get_current_token
from app.domains.identity.schemas import (
    LoginRequest,
    PasswordChangeRequest,
    RefreshRequest,
    TokenResponse,
    UserCreate,
    UserRead,
    UserReadWithRole,
    UserUpdate,
)
from app.domains.identity.service import IdentityService
from app.infrastructure.database.session import get_db

router = APIRouter(prefix="/auth", tags=["Identity & Auth"])


def _svc(db: AsyncSession = Depends(get_db)) -> IdentityService:
    return IdentityService(db)


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    body: UserCreate,
    svc: IdentityService = Depends(_svc),
) -> UserRead:
    try:
        user = await svc.register_user(body)
        return UserRead.model_validate(user)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    svc: IdentityService = Depends(_svc),
) -> TokenResponse:
    try:
        return await svc.login(body)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    body: RefreshRequest,
    svc: IdentityService = Depends(_svc),
) -> TokenResponse:
    try:
        return await svc.refresh_tokens(body.refresh_token)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.get("/me", response_model=UserReadWithRole)
async def me(
    token: TokenPayload = Depends(get_current_token),
    svc: IdentityService = Depends(_svc),
) -> UserReadWithRole:
    try:
        user = await svc.get_user(UUID(token.sub))
        return UserReadWithRole.model_validate(user)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.patch("/me", response_model=UserRead)
async def update_me(
    body: UserUpdate,
    token: TokenPayload = Depends(get_current_token),
    svc: IdentityService = Depends(_svc),
) -> UserRead:
    try:
        user = await svc.update_user(UUID(token.sub), body, UUID(token.sub))
        return UserRead.model_validate(user)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.post("/me/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    body: PasswordChangeRequest,
    token: TokenPayload = Depends(get_current_token),
    svc: IdentityService = Depends(_svc),
) -> None:
    try:
        await svc.change_password(UUID(token.sub), body)
    except NilaBaseError as exc:
        raise exc.to_http()
