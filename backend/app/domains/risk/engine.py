"""
Nila Arumbu — Explainable Risk Engine (Strategy Pattern)
No black-box AI. Every score is fully explainable.

Weights:
  Attendance   20%
  Nutrition    25%
  Development  25%
  Caregiver    15%
  Migration    15%

Output:
  GREEN  0–30
  YELLOW 31–70
  RED    71–100
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any
import logging

logger = logging.getLogger(__name__)


# ── Input context ─────────────────────────────────────────────────────────────

@dataclass
class ChildRiskContext:
    child_id: str
    total_sessions: int = 0
    attended_sessions: int = 0
    weight_for_age_z: float = 0.0
    height_for_age_z: float = 0.0
    muac_cm: float = 15.0
    development_milestone_score: float = 100.0
    primary_caregiver_present: bool = True
    caregiver_literate: bool = True
    household_income_below_poverty: bool = False
    has_migrated_in_last_6_months: bool = False
    migration_count_last_year: int = 0


@dataclass
class StrategyResult:
    name: str
    raw_score: float
    weighted_score: float
    weight: float
    factors: list[str] = field(default_factory=list)
    explanation: str = ""


@dataclass
class RiskEngineOutput:
    child_id: str
    total_score: float
    risk_level: str
    component_scores: dict[str, float]
    weight_breakdown: dict[str, float]
    contributing_factors: list[str]
    explanation: str


# ── Strategy base ─────────────────────────────────────────────────────────────

class RiskStrategy(ABC):
    WEIGHT: float = 0.0

    @abstractmethod
    def calculate(self, ctx: ChildRiskContext) -> StrategyResult: ...


# ── Concrete strategies ───────────────────────────────────────────────────────

class AttendanceRiskStrategy(RiskStrategy):
    WEIGHT = 0.20

    def calculate(self, ctx: ChildRiskContext) -> StrategyResult:
        factors: list[str] = []
        parts: list[str] = []

        if ctx.total_sessions == 0:
            raw = 50.0
            factors.append("attendance_data_missing")
            parts.append("Attendance data unavailable — moderate risk assumed.")
        else:
            rate = ctx.attended_sessions / ctx.total_sessions
            if rate < 0.50:
                raw = 100.0
                factors.append("attendance_critical")
                parts.append(f"Critically low attendance: {rate*100:.0f}% (below 50%).")
            elif rate < 0.75:
                raw = 60.0
                factors.append("attendance_below_threshold")
                parts.append(f"Below-threshold attendance: {rate*100:.0f}% (below 75%).")
            else:
                raw = 0.0
                parts.append(f"Attendance acceptable: {rate*100:.0f}%.")

        return StrategyResult("AttendanceRisk", raw, raw * self.WEIGHT, self.WEIGHT, factors, " ".join(parts))


class NutritionRiskStrategy(RiskStrategy):
    WEIGHT = 0.25

    def calculate(self, ctx: ChildRiskContext) -> StrategyResult:
        factors: list[str] = []
        parts: list[str] = []
        raw = 0.0

        if ctx.weight_for_age_z < -3:
            raw = max(raw, 100.0); factors.append("severe_underweight")
            parts.append("Severely underweight (WAZ < -3).")
        elif ctx.weight_for_age_z < -2:
            raw = max(raw, 65.0); factors.append("underweight")
            parts.append("Underweight (WAZ < -2).")

        if ctx.height_for_age_z < -3:
            raw = max(raw, 90.0); factors.append("severe_stunting")
            parts.append("Severe stunting (HAZ < -3).")
        elif ctx.height_for_age_z < -2:
            raw = max(raw, 55.0); factors.append("stunting")
            parts.append("Stunting detected (HAZ < -2).")

        if ctx.muac_cm < 11.5:
            raw = max(raw, 100.0); factors.append("severe_acute_malnutrition")
            parts.append(f"SAM: MUAC {ctx.muac_cm}cm.")
        elif ctx.muac_cm < 12.5:
            raw = max(raw, 70.0); factors.append("moderate_acute_malnutrition")
            parts.append(f"MAM: MUAC {ctx.muac_cm}cm.")

        if not parts:
            parts.append("Nutritional status within acceptable range.")

        return StrategyResult("NutritionRisk", raw, raw * self.WEIGHT, self.WEIGHT, factors, " ".join(parts))


class DevelopmentRiskStrategy(RiskStrategy):
    WEIGHT = 0.25

    def calculate(self, ctx: ChildRiskContext) -> StrategyResult:
        factors: list[str] = []
        parts: list[str] = []
        s = ctx.development_milestone_score

        if s < 40:
            raw = 100.0; factors.append("severe_developmental_delay")
            parts.append(f"Severe developmental delay (score {s:.0f}/100).")
        elif s < 60:
            raw = 70.0; factors.append("developmental_delay")
            parts.append(f"Developmental delay (score {s:.0f}/100).")
        elif s < 80:
            raw = 30.0; factors.append("mild_developmental_concern")
            parts.append(f"Mild developmental concern (score {s:.0f}/100).")
        else:
            raw = 0.0
            parts.append(f"Development on track (score {s:.0f}/100).")

        return StrategyResult("DevelopmentRisk", raw, raw * self.WEIGHT, self.WEIGHT, factors, " ".join(parts))


class CaregiverRiskStrategy(RiskStrategy):
    WEIGHT = 0.15

    def calculate(self, ctx: ChildRiskContext) -> StrategyResult:
        factors: list[str] = []
        parts: list[str] = []
        raw = 0.0

        if not ctx.primary_caregiver_present:
            raw += 40.0; factors.append("no_primary_caregiver")
            parts.append("No primary caregiver present.")
        if not ctx.caregiver_literate:
            raw += 25.0; factors.append("caregiver_illiterate")
            parts.append("Primary caregiver is not literate.")
        if ctx.household_income_below_poverty:
            raw += 35.0; factors.append("poverty")
            parts.append("Household income below poverty line.")

        raw = min(raw, 100.0)
        if not parts:
            parts.append("Caregiver environment is stable.")

        return StrategyResult("CaregiverRisk", raw, raw * self.WEIGHT, self.WEIGHT, factors, " ".join(parts))


class MigrationRiskStrategy(RiskStrategy):
    WEIGHT = 0.15

    def calculate(self, ctx: ChildRiskContext) -> StrategyResult:
        factors: list[str] = []
        parts: list[str] = []
        raw = 0.0

        if ctx.has_migrated_in_last_6_months:
            raw += 60.0; factors.append("recent_migration")
            parts.append("Child migrated in the last 6 months.")
        if ctx.migration_count_last_year > 2:
            raw += 40.0; factors.append("frequent_migration")
            parts.append(f"Migrated {ctx.migration_count_last_year}x in the past year.")

        raw = min(raw, 100.0)
        if not parts:
            parts.append("No migration risk detected.")

        return StrategyResult("MigrationRisk", raw, raw * self.WEIGHT, self.WEIGHT, factors, " ".join(parts))


# ── Risk Engine ───────────────────────────────────────────────────────────────

class RiskEngine:
    """
    Aggregates all strategy results into a single explainable risk score.
    Uses O(1) hash maps for classification and weight lookup.
    """

    _STRATEGIES: list[RiskStrategy] = [
        AttendanceRiskStrategy(),
        NutritionRiskStrategy(),
        DevelopmentRiskStrategy(),
        CaregiverRiskStrategy(),
        MigrationRiskStrategy(),
    ]

    def calculate(self, ctx: ChildRiskContext) -> RiskEngineOutput:
        results = [s.calculate(ctx) for s in self._STRATEGIES]

        total = round(min(max(sum(r.weighted_score for r in results), 0.0), 100.0), 2)
        level = "GREEN" if total <= 30 else ("YELLOW" if total < 70 else "RED")

        component_scores = {r.name: round(r.raw_score, 2) for r in results}
        weight_breakdown = {r.name: r.weight for r in results}
        all_factors = [f for r in results for f in r.factors]

        level_label = {"GREEN": "Low Risk", "YELLOW": "Medium Risk", "RED": "High Risk"}[level]
        explanation_parts = [f"Overall: {level_label} (Score: {total:.1f}/100)."]
        explanation_parts += [f"[{r.name}] {r.explanation}" for r in results if r.explanation]

        logger.info("Risk calculated child=%s score=%.2f level=%s", ctx.child_id, total, level)

        return RiskEngineOutput(
            child_id=ctx.child_id,
            total_score=total,
            risk_level=level,
            component_scores=component_scores,
            weight_breakdown=weight_breakdown,
            contributing_factors=all_factors,
            explanation=" ".join(explanation_parts),
        )


# Module-level singleton
risk_engine = RiskEngine()
