"""
Nila Arumbu — Learning Planner Engine
Generates actionable activity plans based on child context.
Uses O(1) hash map lookups for age-band and risk-level activity selection.
"""
from dataclasses import dataclass, field


@dataclass
class PlanInput:
    child_id: str
    age_in_months: int
    risk_level: str           # GREEN | YELLOW | RED
    developmental_status: str  # ON_TRACK | MILD_DELAY | MODERATE_DELAY | SEVERE_DELAY
    referral_outcome: str | None = None  # VISITED | CLOSED | None


@dataclass
class ActivityPlan:
    centre_activities: list[str] = field(default_factory=list)
    home_activities: list[str] = field(default_factory=list)
    school_readiness_tasks: list[str] = field(default_factory=list)


# ── Age-band activity library (O(1) lookup by band key) ──────────────────────

_AGE_BAND_ACTIVITIES: dict[str, dict[str, list[str]]] = {
    "0-12": {
        "centre": [
            "Sensory play with safe textured objects",
            "Tummy time exercises (5 min sessions)",
            "Caregiver-led singing and talking sessions",
        ],
        "home": [
            "Daily skin-to-skin contact with caregiver",
            "Respond to baby's sounds and gestures",
            "Introduce high-contrast visual toys",
        ],
        "school_readiness": [],
    },
    "13-24": {
        "centre": [
            "Stacking blocks and shape sorting",
            "Simple picture book reading",
            "Group play with 2–3 children",
        ],
        "home": [
            "Name objects during daily routines",
            "Encourage self-feeding with spoon",
            "Outdoor walking and exploration",
        ],
        "school_readiness": [
            "Practice following 2-step instructions",
        ],
    },
    "25-36": {
        "centre": [
            "Pretend play and role-play activities",
            "Simple puzzles (4–6 pieces)",
            "Group singing and rhymes in Tamil",
        ],
        "home": [
            "Read Tamil picture books daily",
            "Encourage dressing and undressing practice",
            "Simple sorting games (colours, shapes)",
        ],
        "school_readiness": [
            "Practice holding pencil/crayon",
            "Recognise own name when written",
        ],
    },
    "37-48": {
        "centre": [
            "Drawing and colouring activities",
            "Counting objects up to 10",
            "Cooperative games with peers",
        ],
        "home": [
            "Tell stories about daily events",
            "Practice counting household objects",
            "Encourage questions and curiosity",
        ],
        "school_readiness": [
            "Write own name with support",
            "Identify basic shapes and colours",
            "Follow classroom-style instructions",
        ],
    },
    "49-72": {
        "centre": [
            "Pre-literacy: letter recognition in Tamil",
            "Number concepts 1–20",
            "Group problem-solving activities",
        ],
        "home": [
            "Read together for 15 minutes daily",
            "Practice writing letters and numbers",
            "Encourage independent task completion",
        ],
        "school_readiness": [
            "Recognise Tamil vowels (உயிர் எழுத்துக்கள்)",
            "Count and write numbers 1–10",
            "Sit and focus for 20-minute activity",
        ],
    },
}

# ── Risk-level supplementary activities ──────────────────────────────────────

_RISK_SUPPLEMENTS: dict[str, dict[str, list[str]]] = {
    "YELLOW": {
        "centre": ["Weekly one-on-one worker check-in", "Targeted nutrition counselling session"],
        "home": ["Daily caregiver activity log", "Weekly home visit by Anganwadi worker"],
    },
    "RED": {
        "centre": [
            "Daily monitoring by Anganwadi worker",
            "Immediate referral follow-up coordination",
            "Therapeutic feeding support if SAM/MAM",
        ],
        "home": [
            "Twice-weekly home visits",
            "Emergency contact card provided to family",
            "Caregiver counselling on child stimulation",
        ],
    },
}

# ── Developmental delay supplements ──────────────────────────────────────────

_DELAY_SUPPLEMENTS: dict[str, list[str]] = {
    "MILD_DELAY": [
        "Additional 15-min daily stimulation activity",
        "Refer to developmental checklist review next month",
    ],
    "MODERATE_DELAY": [
        "Refer to PHC for developmental evaluation",
        "Structured daily therapy exercises from worker",
        "Monthly developmental re-assessment",
    ],
    "SEVERE_DELAY": [
        "Immediate specialist referral required",
        "Daily structured intervention programme",
        "Caregiver training on home therapy techniques",
    ],
}


def _get_age_band(age_months: int) -> str:
    if age_months <= 12:
        return "0-12"
    if age_months <= 24:
        return "13-24"
    if age_months <= 36:
        return "25-36"
    if age_months <= 48:
        return "37-48"
    return "49-72"


class LearningPlanner:
    """
    Generates contextual activity plans.
    All lookups are O(1) via hash maps.
    """

    def generate(self, inp: PlanInput) -> ActivityPlan:
        band = _get_age_band(inp.age_in_months)
        base = _AGE_BAND_ACTIVITIES.get(band, _AGE_BAND_ACTIVITIES["25-36"])

        centre = list(base["centre"])
        home = list(base["home"])
        school = list(base["school_readiness"])

        # Add risk-level supplements
        risk_sup = _RISK_SUPPLEMENTS.get(inp.risk_level, {})
        centre.extend(risk_sup.get("centre", []))
        home.extend(risk_sup.get("home", []))

        # Add developmental delay supplements
        delay_sup = _DELAY_SUPPLEMENTS.get(inp.developmental_status, [])
        centre.extend(delay_sup)

        return ActivityPlan(
            centre_activities=centre,
            home_activities=home,
            school_readiness_tasks=school,
        )


# Module-level singleton
learning_planner = LearningPlanner()
