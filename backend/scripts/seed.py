"""
Nila Arumbu — Database Seed Script
Creates default roles, permissions, and an admin user.

Usage:
    cd backend
    source venv/bin/activate
    python scripts/seed.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings
from app.core.security import hash_password
# Import ALL models so SQLAlchemy resolves all relationships
from app.domains.identity.models import Permission, Role, User, role_permissions  # noqa
from app.domains.child.models import Centre, Child, ChildPassport, MigrationHistory  # noqa
from app.domains.attendance.models import AttendanceRecord  # noqa
from app.domains.growth.models import GrowthRecord  # noqa
from app.domains.risk.models import RiskScore  # noqa
from app.domains.referral.models import Referral, ReferralStatusLog  # noqa
from app.domains.development.models import DevelopmentAssessment  # noqa
from app.domains.learning.models import LearningActivity  # noqa
from app.domains.notification.models import Notification  # noqa
from app.domains.engagement.models import ParentEngagementLog  # noqa
from app.domains.audit.models import AuditLog  # noqa

engine = create_async_engine(settings.async_database_url, echo=False)
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# ── Seed data ─────────────────────────────────────────────────────────────────

ROLES = [
    {"name": "ANGANWADI_WORKER",  "description": "Front-line Anganwadi worker"},
    {"name": "SUPERVISOR",        "description": "Block-level supervisor"},
    {"name": "DISTRICT_OFFICER",  "description": "District programme officer"},
    {"name": "STATE_ADMIN",       "description": "State-level administrator"},
    {"name": "NGO_PARTNER",       "description": "NGO partner organisation"},
    {"name": "PARENT",            "description": "Parent or caregiver"},
]

PERMISSIONS = [
    {"name": "child:read",        "resource": "child",    "action": "read"},
    {"name": "child:write",       "resource": "child",    "action": "write"},
    {"name": "child:delete",      "resource": "child",    "action": "delete"},
    {"name": "referral:read",     "resource": "referral", "action": "read"},
    {"name": "referral:write",    "resource": "referral", "action": "write"},
    {"name": "referral:close",    "resource": "referral", "action": "close"},
    {"name": "risk:read",         "resource": "risk",     "action": "read"},
    {"name": "risk:calculate",    "resource": "risk",     "action": "calculate"},
    {"name": "attendance:write",  "resource": "attendance","action": "write"},
    {"name": "growth:write",      "resource": "growth",   "action": "write"},
    {"name": "user:manage",       "resource": "user",     "action": "manage"},
    {"name": "report:read",       "resource": "report",   "action": "read"},
]

# Role → permission names
ROLE_PERMISSIONS: dict[str, list[str]] = {
    "ANGANWADI_WORKER": [
        "child:read", "child:write",
        "attendance:write", "growth:write",
        "referral:read", "referral:write",
        "risk:read",
    ],
    "SUPERVISOR": [
        "child:read", "child:write",
        "attendance:write", "growth:write",
        "referral:read", "referral:write", "referral:close",
        "risk:read", "risk:calculate",
        "report:read",
    ],
    "DISTRICT_OFFICER": [
        "child:read", "referral:read", "referral:close",
        "risk:read", "risk:calculate", "report:read",
    ],
    "STATE_ADMIN": [p["name"] for p in PERMISSIONS],  # all permissions
    "NGO_PARTNER": ["child:read", "referral:read", "risk:read", "report:read"],
    "PARENT":      ["child:read"],
}

DEMO_CENTRE = {
    "name": "Chennai Central Anganwadi",
    "code": "TN-CH-001",
    "district": "Chennai",
    "block": "Egmore",
    "village": "Egmore",
    "pincode": "600008",
}

ADMIN_USER = {
    "email": "admin@nilarumbu.gov.in",
    "full_name": "System Administrator",
    "password": "NilaAdmin@2024",
    "phone": "+919876543210",
}

DEMO_WORKER = {
    "email": "worker@nilarumbu.gov.in",
    "full_name": "Lakshmi Devi",
    "password": "Worker@2024",
    "phone": "+919876543211",
}


async def seed() -> None:
    async with SessionLocal() as session:
        print("🌱 Seeding Nila Arumbu database…")

        # ── Permissions ───────────────────────────────────────────────────────
        from sqlalchemy import select
        perm_map: dict[str, Permission] = {}
        for p in PERMISSIONS:
            result = await session.execute(
                select(Permission).where(Permission.name == p["name"])
            )
            existing = result.scalar_one_or_none()
            if existing is None:
                perm = Permission(name=p["name"], resource=p["resource"], action=p["action"])
                session.add(perm)
                await session.flush()
                perm_map[p["name"]] = perm
                print(f"  ✓ Permission: {p['name']}")
            else:
                perm_map[p["name"]] = existing

        # ── Roles ─────────────────────────────────────────────────────────────
        role_map: dict[str, Role] = {}
        for r in ROLES:
            result = await session.execute(select(Role).where(Role.name == r["name"]))
            existing = result.scalar_one_or_none()
            if existing is None:
                role = Role(name=r["name"], description=r["description"])
                session.add(role)
                await session.flush()
                role_map[r["name"]] = role
                print(f"  ✓ Role: {r['name']}")
            else:
                role_map[r["name"]] = existing

        # ── Role-Permission assignments (direct insert, no lazy load) ──────────
        from sqlalchemy.dialects.postgresql import insert as pg_insert
        for role_name, perm_names in ROLE_PERMISSIONS.items():
            role = role_map[role_name]
            for perm_name in perm_names:
                perm = perm_map.get(perm_name)
                if perm:
                    await session.execute(
                        pg_insert(role_permissions)
                        .values(role_id=role.id, permission_id=perm.id)
                        .on_conflict_do_nothing()
                    )

        await session.flush()

        # ── Demo centre ───────────────────────────────────────────────────────
        from sqlalchemy import select
        centre_result = await session.execute(
            select(Centre).where(Centre.code == DEMO_CENTRE["code"])
        )
        centre = centre_result.scalar_one_or_none()
        if centre is None:
            centre = Centre(**DEMO_CENTRE)
            session.add(centre)
            await session.flush()
            print(f"  ✓ Centre: {DEMO_CENTRE['name']}")

        # ── Admin user ────────────────────────────────────────────────────────
        admin_result = await session.execute(
            select(User).where(User.email == ADMIN_USER["email"])
        )
        if admin_result.scalar_one_or_none() is None:
            admin = User(
                email=ADMIN_USER["email"],
                full_name=ADMIN_USER["full_name"],
                phone=ADMIN_USER["phone"],
                hashed_password=hash_password(ADMIN_USER["password"]),
                role_id=role_map["STATE_ADMIN"].id,
                is_active=True,
            )
            session.add(admin)
            print(f"  ✓ Admin user: {ADMIN_USER['email']}")

        # ── Demo worker ───────────────────────────────────────────────────────
        worker_result = await session.execute(
            select(User).where(User.email == DEMO_WORKER["email"])
        )
        if worker_result.scalar_one_or_none() is None:
            worker = User(
                email=DEMO_WORKER["email"],
                full_name=DEMO_WORKER["full_name"],
                phone=DEMO_WORKER["phone"],
                hashed_password=hash_password(DEMO_WORKER["password"]),
                role_id=role_map["ANGANWADI_WORKER"].id,
                centre_id=centre.id,
                is_active=True,
            )
            session.add(worker)
            print(f"  ✓ Worker user: {DEMO_WORKER['email']}")

        await session.commit()
        print("\n✅ Seed complete.")
        print("\nLogin credentials:")
        print(f"  Admin  → {ADMIN_USER['email']} / {ADMIN_USER['password']}")
        print(f"  Worker → {DEMO_WORKER['email']} / {DEMO_WORKER['password']}")


if __name__ == "__main__":
    asyncio.run(seed())
