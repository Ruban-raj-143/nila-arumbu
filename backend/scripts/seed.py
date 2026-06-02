"""
Nila Arumbu — Database Seed Script
Creates roles, permissions, demo users, 3 centres, and 12 realistic
Tamil Nadu children with growth, attendance, risk and referral records.

Usage:
    cd backend
    source venv/bin/activate
    python scripts/seed.py
"""
import asyncio
import sys
import os
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from app.core.config import settings
from app.core.security import hash_password
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

TODAY = date.today()


# ── Static seed data ──────────────────────────────────────────────────────────

ROLES = [
    {"name": "ANGANWADI_WORKER",  "description": "Front-line Anganwadi worker"},
    {"name": "SUPERVISOR",        "description": "Block-level supervisor"},
    {"name": "DISTRICT_OFFICER",  "description": "District programme officer"},
    {"name": "STATE_ADMIN",       "description": "State-level administrator"},
    {"name": "NGO_PARTNER",       "description": "NGO partner organisation"},
    {"name": "PARENT",            "description": "Parent or caregiver"},
]

PERMISSIONS = [
    {"name": "child:read",        "resource": "child",     "action": "read"},
    {"name": "child:write",       "resource": "child",     "action": "write"},
    {"name": "child:delete",      "resource": "child",     "action": "delete"},
    {"name": "referral:read",     "resource": "referral",  "action": "read"},
    {"name": "referral:write",    "resource": "referral",  "action": "write"},
    {"name": "referral:close",    "resource": "referral",  "action": "close"},
    {"name": "risk:read",         "resource": "risk",      "action": "read"},
    {"name": "risk:calculate",    "resource": "risk",      "action": "calculate"},
    {"name": "attendance:write",  "resource": "attendance","action": "write"},
    {"name": "growth:write",      "resource": "growth",    "action": "write"},
    {"name": "user:manage",       "resource": "user",      "action": "manage"},
    {"name": "report:read",       "resource": "report",    "action": "read"},
]

ROLE_PERMISSIONS: dict[str, list[str]] = {
    "ANGANWADI_WORKER": ["child:read","child:write","attendance:write","growth:write",
                         "referral:read","referral:write","risk:read"],
    "SUPERVISOR": ["child:read","child:write","attendance:write","growth:write",
                   "referral:read","referral:write","referral:close",
                   "risk:read","risk:calculate","report:read"],
    "DISTRICT_OFFICER": ["child:read","referral:read","referral:close",
                         "risk:read","risk:calculate","report:read"],
    "STATE_ADMIN": [p["name"] for p in PERMISSIONS],
    "NGO_PARTNER": ["child:read","referral:read","risk:read","report:read"],
    "PARENT":      ["child:read"],
}


# ── Centres ───────────────────────────────────────────────────────────────────

CENTRES = [
    {"name": "Chennai Central Anganwadi", "code": "TN-CH-001",
     "district": "Chennai",  "block": "Egmore",    "village": "Egmore",       "pincode": "600008"},
    {"name": "Tambaram Anganwadi Centre", "code": "TN-CH-002",
     "district": "Chennai",  "block": "Tambaram",  "village": "Tambaram",     "pincode": "600045"},
    {"name": "Madurai South Anganwadi",   "code": "TN-MDU-001",
     "district": "Madurai",  "block": "Tallakulam","village": "Tallakulam",   "pincode": "625002"},
]

# ── Users ─────────────────────────────────────────────────────────────────────

ADMIN_USER  = {"email": "admin@nilarumbu.gov.in",  "full_name": "System Administrator",
               "password": "NilaAdmin@2024", "phone": "+919876543210"}
DEMO_WORKER = {"email": "worker@nilarumbu.gov.in", "full_name": "Lakshmi Devi",
               "password": "Worker@2024",    "phone": "+919876543211"}
SUPERVISOR  = {"email": "supervisor@nilarumbu.gov.in", "full_name": "Rajesh Kumar",
               "password": "Supervisor@2024","phone": "+919876543212"}


# ── 12 Realistic Tamil Children ───────────────────────────────────────────────
# dob relative to TODAY so ages stay current
# risk_level / risk_score drive the RiskScore record
# growth: (weight_kg, height_cm, muac_cm, waz, haz, nutrition_status)
# attendance_rate: fraction of last 20 sessions present
# referral: optional (type, status, reason, escalated)

CHILDREN_DATA = [
    # ── RED risk (score 70-100) ────────────────────────────────────────────
    {
        "first_name": "Aravind",   "last_name": "Kumar",
        "dob": TODAY - timedelta(days=4*365+62),  # 4y 2m
        "gender": "MALE",
        "aadhaar": "4512 3678 9012",
        "mother_name": "Meena Kumar",  "father_name": "Suresh Kumar",
        "guardian_phone": "+916369713571",
        "centre_idx": 0,
        "growth": (8.2, 94.0, 10.5, -3.5, -2.8, "SAM"),
        "attendance_rate": 0.30,  # 6/20 — very poor
        "risk_level": "RED", "risk_score": 78.0,
        "risk_factors": ["SAM detected", "Poor attendance (30%)", "Severe underweight WAZ -3.5"],
        "referral": {"type": "NRC", "status": "APPOINTMENT_PENDING", "escalated": True,
                     "reason": "SAM detected — MUAC 10.5cm. Severe underweight (WAZ -3.5). NRC admission required.",
                     "referred_to": "Institute of Child Health, Egmore"},
    },
    {
        "first_name": "Saanvi",    "last_name": "Moorthy",
        "dob": TODAY - timedelta(days=3*365+335), # 3y 11m
        "gender": "FEMALE",
        "aadhaar": "7823 4591 0023",
        "mother_name": "Kavitha Moorthy", "father_name": "Mohan Moorthy",
        "guardian_phone": "+917200134562",
        "centre_idx": 0,
        "growth": (8.6, 90.5, 10.8, -3.2, -3.1, "SAM"),
        "attendance_rate": 0.25,  # 5/20
        "risk_level": "RED", "risk_score": 82.0,
        "risk_factors": ["SAM — MUAC 10.8cm", "Stunting HAZ -3.1", "Attendance 25%"],
        "referral": {"type": "NRC", "status": "REFERRED", "escalated": True,
                     "reason": "SAM with stunting. HAZ -3.1, WAZ -3.2. Immediate NRC referral.",
                     "referred_to": "Govt. Kilpauk Medical College Hospital"},
    },
    {
        "first_name": "Balamurugan", "last_name": "Siva",
        "dob": TODAY - timedelta(days=5*365+0),   # 5y 0m
        "gender": "MALE",
        "aadhaar": "3341 8920 5671",
        "mother_name": "Selvi Siva", "father_name": "Shankar Siva",
        "guardian_phone": "+919944223311",
        "centre_idx": 1,
        "growth": (12.1, 100.2, 12.0, -2.8, -2.2, "MAM"),
        "attendance_rate": 0.40,  # 8/20
        "risk_level": "RED", "risk_score": 76.0,
        "risk_factors": ["MAM — MUAC 12.0cm", "Wasting WAZ -2.8", "Attendance 40%"],
        "referral": {"type": "PHC", "status": "APPOINTMENT_PENDING", "escalated": False,
                     "reason": "MAM borderline SAM. MUAC 12.0cm declining trend over 3 months.",
                     "referred_to": "Tambaram PHC"},
    },

    # ── YELLOW risk (score 31-69) ──────────────────────────────────────────
    {
        "first_name": "Priya",     "last_name": "Devi",
        "dob": TODAY - timedelta(days=4*365+305), # 4y 10m
        "gender": "FEMALE",
        "aadhaar": "6120 4487 3390",
        "mother_name": "Valli Devi", "father_name": "Rajan Devi",
        "guardian_phone": "+918012345678",
        "centre_idx": 0,
        "growth": (13.5, 101.0, 13.5, -1.8, -1.5, "MAM"),
        "attendance_rate": 0.65,  # 13/20
        "risk_level": "YELLOW", "risk_score": 52.0,
        "risk_factors": ["MAM — borderline", "Mild stunting HAZ -1.5"],
        "referral": {"type": "PHC", "status": "FOLLOWUP", "escalated": False,
                     "reason": "MAM — weight gain monitoring required. Follow-up at PHC.",
                     "referred_to": "Egmore PHC"},
    },
    {
        "first_name": "Deepa",     "last_name": "Raj",
        "dob": TODAY - timedelta(days=3*365+245), # 3y 8m
        "gender": "FEMALE",
        "aadhaar": "8834 5512 7741",
        "mother_name": "Latha Raj", "father_name": "Mani Raj",
        "guardian_phone": "+917358901234",
        "centre_idx": 1,
        "growth": (11.8, 93.0, 13.2, -2.1, -1.8, "MAM"),
        "attendance_rate": 0.55,
        "risk_level": "YELLOW", "risk_score": 48.0,
        "risk_factors": ["MAM — WAZ -2.1", "Irregular attendance 55%"],
        "referral": None,
    },
    {
        "first_name": "Nandhini",  "last_name": "Krishnan",
        "dob": TODAY - timedelta(days=4*365+120), # 4y 4m
        "gender": "FEMALE",
        "aadhaar": "2291 6634 8810",
        "mother_name": "Geetha Krishnan", "father_name": "Arjun Krishnan",
        "guardian_phone": "+919600112233",
        "centre_idx": 2,
        "growth": (13.9, 98.5, 13.8, -1.6, -1.9, "MAM"),
        "attendance_rate": 0.60,
        "risk_level": "YELLOW", "risk_score": 45.0,
        "risk_factors": ["MAM — mild wasting", "Stunting risk HAZ -1.9"],
        "referral": None,
    },
    {
        "first_name": "Keerthana", "last_name": "Rajan",
        "dob": TODAY - timedelta(days=3*365+180), # 3y 6m
        "gender": "FEMALE",
        "aadhaar": "5567 2234 9910",
        "mother_name": "Padma Rajan", "father_name": "Vel Rajan",
        "guardian_phone": "+919500223344",
        "centre_idx": 2,
        "growth": (11.2, 90.0, 13.9, -1.9, -1.7, "MAM"),
        "attendance_rate": 0.50,
        "risk_level": "YELLOW", "risk_score": 42.0,
        "risk_factors": ["MAM borderline", "Attendance 50%", "Mild developmental delay"],
        "referral": None,
    },

    # ── GREEN risk (score 0-30) ────────────────────────────────────────────
    {
        "first_name": "Murugan",   "last_name": "Selvam",
        "dob": TODAY - timedelta(days=3*365+122), # 3y 4m
        "gender": "MALE",
        "aadhaar": "1123 4456 7789",
        "mother_name": "Sumathi Selvam", "father_name": "Selvam Raj",
        "guardian_phone": "+919876001122",
        "centre_idx": 0,
        "growth": (14.8, 96.0, 15.5, -0.3, -0.5, "NORMAL"),
        "attendance_rate": 0.90,
        "risk_level": "GREEN", "risk_score": 12.0,
        "risk_factors": [],
        "referral": None,
    },
    {
        "first_name": "Karthik",   "last_name": "Babu",
        "dob": TODAY - timedelta(days=4*365+183), # 4y 6m
        "gender": "MALE",
        "aadhaar": "4456 7789 0012",
        "mother_name": "Anitha Babu", "father_name": "Babu Krishnan",
        "guardian_phone": "+919876002233",
        "centre_idx": 0,
        "growth": (17.2, 104.5, 16.2, 0.2, 0.1, "NORMAL"),
        "attendance_rate": 0.95,
        "risk_level": "GREEN", "risk_score": 8.0,
        "risk_factors": [],
        "referral": None,
    },
    {
        "first_name": "Dinesh",    "last_name": "Pandian",
        "dob": TODAY - timedelta(days=4*365+30),  # 4y 1m
        "gender": "MALE",
        "aadhaar": "7789 0012 3345",
        "mother_name": "Rani Pandian", "father_name": "Pandian Vel",
        "guardian_phone": "+919876003344",
        "centre_idx": 1,
        "growth": (16.5, 101.0, 16.0, 0.1, -0.2, "NORMAL"),
        "attendance_rate": 0.85,
        "risk_level": "GREEN", "risk_score": 6.0,
        "risk_factors": [],
        "referral": None,
    },
    {
        "first_name": "Surya",     "last_name": "Vel",
        "dob": TODAY - timedelta(days=3*365+300), # 3y 10m
        "gender": "MALE",
        "aadhaar": "0012 3345 6678",
        "mother_name": "Radha Vel", "father_name": "Vel Murugan",
        "guardian_phone": "+919876004455",
        "centre_idx": 2,
        "growth": (15.1, 97.5, 15.8, -0.1, -0.4, "NORMAL"),
        "attendance_rate": 0.80,
        "risk_level": "GREEN", "risk_score": 10.0,
        "risk_factors": [],
        "referral": None,
    },
    {
        "first_name": "Varsha",    "last_name": "Nair",
        "dob": TODAY - timedelta(days=4*365+243), # 4y 8m
        "gender": "FEMALE",
        "aadhaar": "3345 6678 9901",
        "mother_name": "Priya Nair", "father_name": "Sunil Nair",
        "guardian_phone": "+919876005566",
        "centre_idx": 2,
        "growth": (16.8, 103.0, 16.5, 0.3, 0.4, "NORMAL"),
        "attendance_rate": 0.90,
        "risk_level": "GREEN", "risk_score": 4.0,
        "risk_factors": [],
        "referral": None,
    },
]


# ── Seed function ─────────────────────────────────────────────────────────────

async def seed() -> None:
    async with SessionLocal() as session:
        print("🌱 Seeding Nila Arumbu database…\n")

        # ── Permissions ───────────────────────────────────────────────────────
        perm_map: dict[str, Permission] = {}
        for p in PERMISSIONS:
            res = await session.execute(select(Permission).where(Permission.name == p["name"]))
            existing = res.scalar_one_or_none()
            if existing is None:
                perm = Permission(name=p["name"], resource=p["resource"], action=p["action"])
                session.add(perm)
                await session.flush()
                perm_map[p["name"]] = perm
            else:
                perm_map[p["name"]] = existing
        print(f"  ✓ {len(PERMISSIONS)} permissions")

        # ── Roles ─────────────────────────────────────────────────────────────
        role_map: dict[str, Role] = {}
        for r in ROLES:
            res = await session.execute(select(Role).where(Role.name == r["name"]))
            existing = res.scalar_one_or_none()
            if existing is None:
                role = Role(name=r["name"], description=r["description"])
                session.add(role)
                await session.flush()
                role_map[r["name"]] = role
            else:
                role_map[r["name"]] = existing
        print(f"  ✓ {len(ROLES)} roles")

        # ── Role-Permission assignments ────────────────────────────────────────
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
        print("  ✓ Role-permission mappings")


        # ── Centres ───────────────────────────────────────────────────────────
        centre_objs: list[Centre] = []
        for c in CENTRES:
            res = await session.execute(select(Centre).where(Centre.code == c["code"]))
            existing = res.scalar_one_or_none()
            if existing is None:
                obj = Centre(**c)
                session.add(obj)
                await session.flush()
                centre_objs.append(obj)
                print(f"  ✓ Centre: {c['name']}")
            else:
                centre_objs.append(existing)

        # ── Users ─────────────────────────────────────────────────────────────
        for udata, role_name, centre_idx in [
            (ADMIN_USER,  "STATE_ADMIN",       None),
            (DEMO_WORKER, "ANGANWADI_WORKER",  0),
            (SUPERVISOR,  "SUPERVISOR",        0),
        ]:
            res = await session.execute(select(User).where(User.email == udata["email"]))
            if res.scalar_one_or_none() is None:
                u = User(
                    email=udata["email"],
                    full_name=udata["full_name"],
                    phone=udata["phone"],
                    hashed_password=hash_password(udata["password"]),
                    role_id=role_map[role_name].id,
                    centre_id=centre_objs[centre_idx].id if centre_idx is not None else None,
                    is_active=True,
                )
                session.add(u)
                print(f"  ✓ User: {udata['email']}")
        await session.flush()


        # ── Children + related records ────────────────────────────────────────
        print(f"\n  🧒 Seeding {len(CHILDREN_DATA)} children with records…")
        for i, cd in enumerate(CHILDREN_DATA):
            centre = centre_objs[cd["centre_idx"]]

            # Skip if already exists (idempotent by aadhaar)
            res = await session.execute(
                select(Child).where(Child.aadhaar_number == cd["aadhaar"])
            )
            child = res.scalar_one_or_none()
            if child is None:
                child = Child(
                    first_name=cd["first_name"],
                    last_name=cd["last_name"],
                    date_of_birth=cd["dob"],
                    gender=cd["gender"],
                    aadhaar_number=cd["aadhaar"],
                    mother_name=cd["mother_name"],
                    father_name=cd["father_name"],
                    guardian_name=cd["mother_name"],
                    guardian_phone=cd["guardian_phone"],
                    centre_id=centre.id,
                )
                session.add(child)
                await session.flush()

            # ── Growth record (latest measurement) ────────────────────────────
            res = await session.execute(
                select(GrowthRecord).where(GrowthRecord.child_id == child.id)
            )
            if res.scalar_one_or_none() is None:
                w, h, muac, waz, haz, status = cd["growth"]
                gr = GrowthRecord(
                    child_id=child.id,
                    recorded_date=TODAY - timedelta(days=7),
                    weight_kg=w, height_cm=h, muac_cm=muac,
                    weight_for_age_z=waz, height_for_age_z=haz,
                    weight_for_height_z=round(waz - 0.3, 1),
                    nutrition_status=status,
                    notes=f"Monthly measurement — {status}",
                )
                session.add(gr)


            # ── Attendance records (last 20 sessions) ─────────────────────────
            present_count = int(cd["attendance_rate"] * 20)
            for day_offset in range(20):
                session_date = TODAY - timedelta(days=day_offset * 2)
                res = await session.execute(
                    select(AttendanceRecord).where(
                        AttendanceRecord.child_id == child.id,
                        AttendanceRecord.session_date == session_date,
                    )
                )
                if res.scalar_one_or_none() is None:
                    att_status = "PRESENT" if day_offset < present_count else "ABSENT"
                    session.add(AttendanceRecord(
                        child_id=child.id,
                        centre_id=centre.id,
                        session_date=session_date,
                        status=att_status,
                    ))

            # ── Risk score ────────────────────────────────────────────────────
            res = await session.execute(
                select(RiskScore).where(RiskScore.child_id == child.id)
            )
            if res.scalar_one_or_none() is None:
                att_sc   = round((1 - cd["attendance_rate"]) * 100, 1)
                nutr_sc  = abs(cd["growth"][3]) / 4.0 * 100 if cd["risk_level"] != "GREEN" else 5.0
                dev_sc   = 55.0 if cd["risk_level"] == "RED" else (35.0 if cd["risk_level"] == "YELLOW" else 8.0)
                care_sc  = 40.0 if cd["risk_level"] == "RED" else (25.0 if cd["risk_level"] == "YELLOW" else 5.0)
                migr_sc  = 20.0 if cd["risk_level"] != "GREEN" else 0.0
                session.add(RiskScore(
                    child_id=child.id,
                    total_score=cd["risk_score"],
                    risk_level=cd["risk_level"],
                    attendance_score=att_sc,
                    nutrition_score=min(nutr_sc, 100),
                    development_score=dev_sc,
                    caregiver_score=care_sc,
                    migration_score=migr_sc,
                    contributing_factors=cd["risk_factors"],
                    weight_breakdown={"attendance":0.20,"nutrition":0.25,"development":0.25,"caregiver":0.15,"migration":0.15},
                    explanation=(
                        f"{cd['risk_level']} risk (score {cd['risk_score']:.0f}/100). "
                        + (", ".join(cd["risk_factors"]) if cd["risk_factors"] else "All indicators normal.")
                    ),
                ))


            # ── Referral (if applicable) ──────────────────────────────────────
            ref_data = cd.get("referral")
            if ref_data:
                res = await session.execute(
                    select(Referral).where(Referral.child_id == child.id)
                )
                if res.scalar_one_or_none() is None:
                    ref = Referral(
                        child_id=child.id,
                        reason=ref_data["reason"],
                        referral_type=ref_data["type"],
                        status=ref_data["status"],
                        referred_to=ref_data.get("referred_to"),
                        escalated=ref_data["escalated"],
                        escalation_reason=(
                            "Critical nutrition status — immediate intervention required."
                            if ref_data["escalated"] else None
                        ),
                    )
                    session.add(ref)
                    await session.flush()
                    # Add status log
                    session.add(ReferralStatusLog(
                        referral_id=ref.id,
                        from_status=None,
                        to_status="IDENTIFIED",
                        notes="Auto-identified by risk engine.",
                    ))
                    if ref_data["status"] != "IDENTIFIED":
                        session.add(ReferralStatusLog(
                            referral_id=ref.id,
                            from_status="IDENTIFIED",
                            to_status=ref_data["status"],
                            notes="Referred by Anganwadi worker Lakshmi Devi.",
                        ))

            # ── Child Passport ────────────────────────────────────────────────
            res = await session.execute(
                select(ChildPassport).where(ChildPassport.child_id == child.id)
            )
            if res.scalar_one_or_none() is None:
                import uuid as _uuid
                passport_no = f"NP-{TODAY.year}-{str(child.id)[:8].upper()}"
                session.add(ChildPassport(
                    child_id=child.id,
                    passport_number=passport_no,
                    current_risk_level=cd["risk_level"],
                    current_risk_score=str(cd["risk_score"]),
                    total_attendance_sessions=20,
                    attended_sessions=int(cd["attendance_rate"] * 20),
                    active_referral_count=1 if cd.get("referral") else 0,
                ))

            print(f"    ✓ {cd['first_name']} {cd['last_name']} [{cd['risk_level']} · {cd['risk_score']:.0f}]")
            await session.flush()

        # ── Final commit ───────────────────────────────────────────────────────
        await session.commit()

        print("\n✅ Seed complete!")
        print("\n📋 Demo Credentials:")
        print(f"  Admin      → admin@nilarumbu.gov.in       / NilaAdmin@2024")
        print(f"  Worker     → worker@nilarumbu.gov.in      / Worker@2024")
        print(f"  Supervisor → supervisor@nilarumbu.gov.in  / Supervisor@2024")
        print(f"\n🏥 {len(CENTRES)} Centres | 👶 {len(CHILDREN_DATA)} Children")
        red    = sum(1 for c in CHILDREN_DATA if c["risk_level"] == "RED")
        yellow = sum(1 for c in CHILDREN_DATA if c["risk_level"] == "YELLOW")
        green  = sum(1 for c in CHILDREN_DATA if c["risk_level"] == "GREEN")
        print(f"🔴 {red} HIGH  🟡 {yellow} MEDIUM  🟢 {green} LOW risk")


if __name__ == "__main__":
    asyncio.run(seed())
