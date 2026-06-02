"""
Nila Arumbu — Identity Domain Schemas (Pydantic v2)
"""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ── Role ──────────────────────────────────────────────────────────────────────

class RoleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    description: str | None = None


# ── User ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    phone: str | None = Field(None, pattern=r"^\+?[0-9]{10,15}$")
    full_name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8)
    role_id: UUID | None = None
    centre_id: UUID | None = None


class UserUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=255)
    phone: str | None = Field(None, pattern=r"^\+?[0-9]{10,15}$")
    is_active: bool | None = None
    role_id: UUID | None = None
    centre_id: UUID | None = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    email: str
    phone: str | None
    full_name: str
    is_active: bool
    role_id: UUID | None
    centre_id: UUID | None
    created_at: datetime
    updated_at: datetime


class UserReadWithRole(UserRead):
    role: RoleRead | None = None


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class RefreshRequest(BaseModel):
    refresh_token: str


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
