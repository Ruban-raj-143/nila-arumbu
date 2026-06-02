"""
Nila Arumbu — Demo Data Seed Script
Real-looking Tamil Nadu Anganwadi data for testing.
"""
import asyncio
import sys
import os
from datetime import date, timedelta
import random

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy import select
from app.core.config import settings
from app.core.security import hash_password
from app.domains.identity.models import User, Role
from app.domains.child.models import Centre, Child, ChildPassport, MigrationHistory
from app.domains.attendance.models import AttendanceRecord
from app.domains.growth.models import GrowthRecord
from app.domains.development.models import DevelopmentAssessment
from app.domains.risk.models import RiskScore
from app.domains.referral.models import Referral, ReferralStatusLog
from app.domains.engagement.models import ParentEngagementLog
from app.domains.learning.models import LearningActivity
from app.domains.audit.models import AuditLog
from app.domains.notification.models import Notification

import uuid

engine = create_async_engine(settings.async_database_url, echo=False)
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# ── Demo Data ─────────────────────────────────────────────────────────────────

CENTRES = [
    {"name": "Chennai Central Anganwadi", "code": "TN-CH-001", "district": "Chennai", "block": "Egmore", "village": "Egmore", "pincode": "600008"},
    {"name": "Tambaram Anganwadi",        "code": "TN-CH-002", "district": "Chennai", "block": "Tambaram", "village": "Tambaram", "pincode": "600045"},
    {"name": "Madurai South Anganwadi",   "code": "TN-MDU-001","district": "Madurai", "block": "South",    "village": "Anna Nagar", "pincode": "625020"},
]

CHILDREN = [
    # Chennai Centre 1 — mix of risk levels
    {"first_name": "Aravind",     "last_name": "Kumar",     "dob": "2022-03-15", "gender": "MALE",   "mother": "Kavitha Kumar",    "father": "Rajesh Kumar",    "phone": "+916369713571", "centre_idx": 0},
    {"first_name": "Priya",       "last_name": "Devi",      "dob": "2021-07-20", "gender": "FEMALE", "mother": "Meena Devi",        "father": "Suresh Devi",     "phone": "+919876543210", "centre_idx": 0},
    {"first_name": "Murugan",     "last_name": "Selvam",    "dob": "2023-01-10", "gender": "MALE",   "mother": "Lakshmi Selvam",   "father": "Ravi Selvam",     "phone": "+917010203040", "centre_idx": 0},
    {"first_name": "Deepa",       "last_name": "Raj",       "dob": "2022-09-05", "gender": "FEMALE", "mother": "Saranya Raj",      "father": "Vijay Raj",       "phone": "+918012345678", "centre_idx": 0},
    {"first_name": "Karthik",     "last_name": "Babu",      "dob": "2021-12-25", "gender": "MALE",   "mother": "Anitha Babu",      "father": "Senthil Babu",    "phone": "+919123456789", "centre_idx": 0},
    # Chennai Centre 2
    {"first_name": "Saanvi",      "last_name": "Moorthy",   "dob": "2022-06-18", "gender": "FEMALE", "mother": "Divya Moorthy",    "father": "Kumar Moorthy",   "phone": "+916374819203", "centre_idx": 1},
    {"first_name": "Dinesh",      "last_name": "Pandian",   "dob": "2023-04-02", "gender": "MALE",   "mother": "Revathi Pandian",  "father": "Pandian Raj",     "phone": "+917401234567", "centre_idx": 1},
    {"first_name": "Nandhini",    "last_name": "Krishnan",  "dob": "2021-11-14", "gender": "FEMALE", "mother": "Sumathi Krishnan", "father": "Krishnan Muthu",  "phone": "+918501234567", "centre_idx": 1},
    # Madurai Centre
    {"first_name": "Surya",       "last_name": "Vel",       "dob": "2022-08-22", "gender": "MALE",   "mother": "Parvathi Vel",     "father": "Vel Murugan",     "phone": "+919601234567", "centre_idx": 2},
    {"first_name": "Keerthana",   "last_name": "Rajan",     "dob": "2023-02-28", "gender": "FEMALE", "mother": "Malathi Rajan",    "father": "Rajan Gopal",     "phone": "+916701234567", "centre_idx": 2},
    {"first_name": "Balamurugan", "last_name": "Siva",      "dob": "2021-05-10", "gender": "MALE",   "mother": "Kamala Siva",      "father": "Sivakumar",       "phone": "+917801234567", "centre_idx": 2},
    {"first_name": "Varsha",      "last_name": "Nair",      "dob": "2022-12-01", "gender": "FEMALE", "mother": "Usha Nair",        "father": "Nair Rajan",      "phone": "+918901234567", "centre_idx": 2},
]

# Risk profiles per child (index matches CHILDREN)
RISK_PROFILES = [
    # Aravind — HIGH RISK (SAM, low attendance)
    {"waz": -3.5, "haz": -2.8, "muac": 10.5, "attendance_rate": 0.40, "dev_score": 45.0, "caregiver_ok": False, "migrated": True},
    # Priya — MEDIUM RISK
    {"waz": -2.2, "haz": -1.8, "muac": 12.8, "attendance_rate": 0.65, "dev_score": 62.0, "caregiver_ok": True, "migrated": False},
    # Murugan — LOW RISK
    {"waz":  0.2, "haz":  0.5, "muac": 15.2, "attendance_rate": 0.90, "dev_score": 88.0, "caregiver_ok": True, "migrated": False},
    # Deepa — MEDIUM RISK
    {"waz": -2.0, "haz": -2.5, "muac": 12.0, "attendance_rate": 0.70, "dev_score": 58.0, "caregiver_ok": True, "migrated": False},
    # Karthik — LOW RISK
    {"waz":  0.5, "haz":  0.3, "muac": 14.8, "attendance_rate": 0.85, "dev_score": 91.0, "caregiver_ok": True, "migrated": False},
    # Saanvi — HIGH RISK
    {"waz": -3.2, "haz": -3.0, "muac": 11.2, "attendance_rate": 0.45, "dev_score": 38.0, "caregiver_ok": False, "migrated": True},
    # Dinesh — LOW RISK
    {"waz":  0.8, "haz":  0.6, "muac": 15.5, "attendance_rate": 0.92, "dev_score": 93.0, "caregiver_ok": True, "migrated": False},
    # Nandhini — MEDIUM RISK
    {"waz": -1.8, "haz": -2.0, "muac": 13.0, "attendance_rate": 0.72, "dev_score": 65.0, "caregiver_ok": True, "migrated": False},
    # Surya — LOW RISK
    {"waz":  0.3, "haz":  0.1, "muac": 14.5, "attendance_rate": 0.88, "dev_score": 85.0, "caregiver_ok": True, "migrated": False},
    # Keerthana — MEDIUM RISK
    {"waz": -2.5, "haz": -1.5, "muac": 12.5, "attendance_rate": 0.60, "dev_score": 60.0, "caregiver_ok": True, "migrated": False},
    # Balamurugan — HIGH RISK (migrant family, poverty)
    {"waz": -3.0, "haz": -2.9, "muac": 11.8, "attendance_rate": 0.35, "dev_score": 42.0, "caregiver_ok": False, "migrated": True},
    # Varsha — LOW RISK
    {"waz":  0.6, "haz":  0.4, "muac": 15.8, "attendance_rate": 0.95, "dev_score": 96.0, "caregiver_ok": True, "migrated": False},
]

def classify_risk(profile: dict) -> tuple[float, str]:
    waz_s   = max(0, min(100, 50 + abs(min(0, profile["waz"])) * 25))
    muac    = profile["muac"]
    muac_s  = 100 if muac < 11.5 else (70 if muac < 12.5 else 0)
    nut_s   = max(waz_s, muac_s)
    att_s   = max(0, (1 - profile["attendance_rate"]) * 100)
    dev_s   = max(0, 100 - profile["dev_score"])
    care_s  = 0 if profile["caregiver_ok"] else 55
    mig_s   = 60 if profile["migrated"] else 0

    total = round(
        nut_s * 0.25 + att_s * 0.20 + dev_s * 0.25 + care_s * 0.15 + mig_s * 0.15, 2
    )
    total = min(100, total)
    level = "GREEN" if total < 31 else ("YELLOW" if total < 70 else "RED")
    return total, level

def gen_passport_number(i: int) -> str:
    return f"NA-{str(i+1001).zfill(6)}"

async def seed():
    async with SessionLocal() as session:
        print("🌱 Seeding demo data…\n")

        # ── Get existing centre + worker ─────────────────────────────────────
        centre_result = await session.execute(select(Centre).where(Centre.is_deleted == False))
        existing_centres = {c.code: c for c in centre_result.scalars().all()}

        worker_result = await session.execute(
            select(User).join(Role, User.role_id == Role.id).where(Role.name == "ANGANWADI_WORKER")
        )
        worker = worker_result.scalar_one_or_none()
        worker_id = worker.id if worker else None

        # ── Create centres if missing ────────────────────────────────────────
        centre_objs = []
        for c in CENTRES:
            if c["code"] in existing_centres:
                centre_objs.append(existing_centres[c["code"]])
            else:
                obj = Centre(**c)
                session.add(obj)
                await session.flush()
                centre_objs.append(obj)
                print(f"  ✓ Centre: {c['name']}")

        # ── Create children ──────────────────────────────────────────────────
        child_objs = []
        for i, cd in enumerate(CHILDREN):
            # Check duplicate
            exists = await session.execute(
                select(Child).where(Child.first_name == cd["first_name"], Child.last_name == cd["last_name"])
            )
            if exists.scalar_one_or_none():
                child_objs.append(None)
                continue

            centre = centre_objs[cd["centre_idx"]]
            child = Child(
                first_name=cd["first_name"],
                last_name=cd["last_name"],
                date_of_birth=date.fromisoformat(cd["dob"]),
                gender=cd["gender"],
                mother_name=cd["mother"],
                father_name=cd["father"],
                guardian_name=cd["mother"],
                guardian_phone=cd["phone"],
                centre_id=centre.id,
                created_by=worker_id,
                updated_by=worker_id,
            )
            session.add(child)
            await session.flush()
            child_objs.append(child)

            # Passport
            passport = ChildPassport(
                child_id=child.id,
                passport_number=gen_passport_number(i),
                current_risk_level="GREEN",
                created_by=worker_id,
            )
            session.add(passport)
            await session.flush()
            print(f"  ✓ Child: {cd['first_name']} {cd['last_name']}")

        # ── Attendance, Growth, Risk, Referrals for each child ───────────────
        for i, child in enumerate(child_objs):
            if child is None:
                continue

            profile = RISK_PROFILES[i]
            total_sessions = 20
            attended = int(total_sessions * profile["attendance_rate"])

            # Attendance records — last 20 school days
            for day_offset in range(20):
                s_date = date.today() - timedelta(days=day_offset + 1)
                if s_date.weekday() >= 5:
                    continue
                status = "PRESENT" if day_offset < attended else "ABSENT"
                rec = AttendanceRecord(
                    child_id=child.id,
                    centre_id=child.centre_id,
                    session_date=s_date,
                    status=status,
                    recorded_by=worker_id,
                    created_by=worker_id,
                )
                session.add(rec)

            # Growth record
            dob = child.date_of_birth
            age_months = int((date.today() - dob).days / 30.44)
            weight = 8.5 + age_months * 0.15 + profile["waz"] * 1.2
            height = 65 + age_months * 0.8 + profile["haz"] * 2.0
            growth = GrowthRecord(
                child_id=child.id,
                recorded_date=date.today() - timedelta(days=7),
                weight_kg=round(max(5.0, weight), 1),
                height_cm=round(max(55.0, height), 1),
                muac_cm=profile["muac"],
                weight_for_age_z=profile["waz"],
                height_for_age_z=profile["haz"],
                nutrition_status=(
                    "SAM" if profile["muac"] < 11.5 else
                    "MAM" if profile["muac"] < 12.5 else
                    "SEVERE_UNDERWEIGHT" if profile["waz"] < -3 else
                    "UNDERWEIGHT" if profile["waz"] < -2 else "NORMAL"
                ),
                recorded_by=worker_id,
                created_by=worker_id,
            )
            session.add(growth)

            # Development assessment
            dev_score = profile["dev_score"]
            dev_status = (
                "SEVERE_DELAY" if dev_score < 40 else
                "MODERATE_DELAY" if dev_score < 60 else
                "MILD_DELAY" if dev_score < 80 else "ON_TRACK"
            )
            assessment = DevelopmentAssessment(
                child_id=child.id,
                assessed_date=date.today() - timedelta(days=14),
                age_in_months=age_months,
                gross_motor_score=dev_score + random.uniform(-5, 5),
                fine_motor_score=dev_score + random.uniform(-5, 5),
                language_score=dev_score + random.uniform(-5, 5),
                cognitive_score=dev_score + random.uniform(-5, 5),
                social_emotional_score=dev_score + random.uniform(-5, 5),
                overall_milestone_score=dev_score,
                developmental_status=dev_status,
                milestones=[],
                assessed_by=worker_id,
                created_by=worker_id,
            )
            session.add(assessment)

            # Risk score
            total_score, risk_level = classify_risk(profile)
            factors = []
            if profile["muac"] < 12.5: factors.append("acute_malnutrition")
            if profile["waz"] < -2:    factors.append("underweight")
            if profile["attendance_rate"] < 0.6: factors.append("low_attendance")
            if dev_score < 60:         factors.append("developmental_delay")
            if not profile["caregiver_ok"]: factors.append("caregiver_risk")
            if profile["migrated"]:    factors.append("recent_migration")

            risk = RiskScore(
                child_id=child.id,
                total_score=total_score,
                risk_level=risk_level,
                attendance_score=max(0, (1 - profile["attendance_rate"]) * 100),
                nutrition_score=max(0, min(100, abs(min(0, profile["waz"])) * 25)),
                development_score=max(0, 100 - dev_score),
                caregiver_score=0 if profile["caregiver_ok"] else 55,
                migration_score=60 if profile["migrated"] else 0,
                contributing_factors=factors,
                weight_breakdown={"AttendanceRisk": 0.20, "NutritionRisk": 0.25, "DevelopmentRisk": 0.25, "CaregiverRisk": 0.15, "MigrationRisk": 0.15},
                explanation=f"Overall: {'Low' if risk_level=='GREEN' else 'Medium' if risk_level=='YELLOW' else 'High'} Risk (Score: {total_score:.1f}/100). Factors: {', '.join(factors) if factors else 'None'}.",
                calculated_by=worker_id,
                created_by=worker_id,
            )
            session.add(risk)

            # Update passport risk
            passport_result = await session.execute(
                select(ChildPassport).where(ChildPassport.child_id == child.id)
            )
            passport = passport_result.scalar_one_or_none()
            if passport:
                passport.current_risk_level = risk_level
                passport.current_risk_score = str(round(total_score, 1))
                passport.total_attendance_sessions = total_sessions
                passport.attended_sessions = attended
                passport.last_growth_recorded_at = date.today() - timedelta(days=7)
                passport.last_assessment_at = date.today() - timedelta(days=14)

            # Referrals for HIGH + MEDIUM risk
            if risk_level in ("RED", "YELLOW") and total_score > 40:
                ref_type = "NRC" if risk_level == "RED" else "PHC"
                reason = (
                    f"{'SAM detected' if profile['muac'] < 11.5 else 'MAM detected'} — MUAC {profile['muac']}cm. "
                    f"{'Severe' if profile['waz'] < -3 else 'Moderate'} underweight (WAZ {profile['waz']}). "
                    f"Requires immediate {'NRC admission' if risk_level == 'RED' else 'PHC evaluation'}."
                )
                status = "APPOINTMENT_PENDING" if risk_level == "RED" else "REFERRED"
                referral = Referral(
                    child_id=child.id,
                    reason=reason,
                    referral_type=ref_type,
                    status=status,
                    referred_to=f"Government {ref_type}, {CENTRES[CHILDREN[i]['centre_idx']]['district']}",
                    escalated=(risk_level == "RED"),
                    escalation_reason="Auto-escalated: High risk score > 70" if risk_level == "RED" else None,
                    created_by=worker_id,
                    updated_by=worker_id,
                )
                session.add(referral)
                await session.flush()
                passport.active_referral_count = 1

                # Status log
                log1 = ReferralStatusLog(
                    referral_id=referral.id,
                    from_status=None,
                    to_status="IDENTIFIED",
                    changed_by=worker_id,
                    notes="Referral created based on risk assessment.",
                    created_by=worker_id,
                )
                session.add(log1)
                if status != "IDENTIFIED":
                    log2 = ReferralStatusLog(
                        referral_id=referral.id,
                        from_status="IDENTIFIED",
                        to_status=status,
                        changed_by=worker_id,
                        notes=f"Moved to {status}.",
                        created_by=worker_id,
                    )
                    session.add(log2)

            # WhatsApp engagement log
            msg_type = "RISK_ALERT" if risk_level == "RED" else "WEEKLY_REMINDER"
            eng = ParentEngagementLog(
                child_id=child.id,
                engagement_type=msg_type,
                channel="WHATSAPP",
                message=f"Message sent to guardian of {child.first_name} regarding {msg_type.lower().replace('_', ' ')}.",
                status="SENT",
                sent_by=worker_id,
                created_by=worker_id,
            )
            session.add(eng)

            await session.flush()

        await session.commit()

        # Summary
        children_count = sum(1 for c in child_objs if c is not None)
        high_risk = sum(1 for p in RISK_PROFILES if classify_risk(p)[1] == "RED")
        medium_risk = sum(1 for p in RISK_PROFILES if classify_risk(p)[1] == "YELLOW")
        low_risk = sum(1 for p in RISK_PROFILES if classify_risk(p)[1] == "GREEN")

        print(f"\n✅ Demo data seeded!")
        print(f"\n📊 Summary:")
        print(f"  Children: {children_count}")
        print(f"  🔴 High Risk: {high_risk}")
        print(f"  🟡 Medium Risk: {medium_risk}")
        print(f"  🟢 Low Risk: {low_risk}")
        print(f"  Centres: {len(CENTRES)}")
        print(f"\nOpen http://localhost:5173 and explore!")

if __name__ == "__main__":
    asyncio.run(seed())
