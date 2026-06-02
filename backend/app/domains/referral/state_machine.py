"""
Nila Arumbu — Referral State Machine
Enforces valid lifecycle transitions. Invalid transitions are rejected.
O(1) hash map lookup for transition validation.
"""
from app.core.exceptions import InvalidStateTransitionError


class ReferralState:
    IDENTIFIED = "IDENTIFIED"
    REFERRED = "REFERRED"
    APPOINTMENT_PENDING = "APPOINTMENT_PENDING"
    VISITED = "VISITED"
    FOLLOWUP = "FOLLOWUP"
    CLOSED = "CLOSED"

    ALL: frozenset[str] = frozenset({
        IDENTIFIED, REFERRED, APPOINTMENT_PENDING, VISITED, FOLLOWUP, CLOSED
    })


# O(1) transition map
VALID_TRANSITIONS: dict[str, set[str]] = {
    ReferralState.IDENTIFIED:          {ReferralState.REFERRED},
    ReferralState.REFERRED:            {ReferralState.APPOINTMENT_PENDING},
    ReferralState.APPOINTMENT_PENDING: {ReferralState.VISITED, ReferralState.FOLLOWUP},
    ReferralState.VISITED:             {ReferralState.FOLLOWUP, ReferralState.CLOSED},
    ReferralState.FOLLOWUP:            {ReferralState.VISITED, ReferralState.CLOSED},
    ReferralState.CLOSED:              set(),
}

STATE_LABELS: dict[str, str] = {
    ReferralState.IDENTIFIED:          "Identified",
    ReferralState.REFERRED:            "Referred",
    ReferralState.APPOINTMENT_PENDING: "Appointment Pending",
    ReferralState.VISITED:             "Visited",
    ReferralState.FOLLOWUP:            "Follow-Up Required",
    ReferralState.CLOSED:              "Closed",
}

NEXT_ACTIONS: dict[str, list[str]] = {
    ReferralState.IDENTIFIED:          ["Refer child to appropriate facility"],
    ReferralState.REFERRED:            ["Confirm appointment booking"],
    ReferralState.APPOINTMENT_PENDING: ["Record visit outcome", "Log follow-up if missed"],
    ReferralState.VISITED:             ["Schedule follow-up or close referral"],
    ReferralState.FOLLOWUP:            ["Record next visit", "Escalate if no response"],
    ReferralState.CLOSED:              ["Referral complete — no further action required"],
}


def validate_transition(current: str, target: str) -> list[str]:
    """
    Validates a state transition. Returns allowed next states.
    Raises InvalidStateTransitionError if transition is not permitted.
    """
    allowed = sorted(VALID_TRANSITIONS.get(current, set()))
    if target not in VALID_TRANSITIONS.get(current, set()):
        raise InvalidStateTransitionError(current, target, allowed)
    return NEXT_ACTIONS.get(target, [])


def get_allowed_transitions(current: str) -> list[str]:
    return sorted(VALID_TRANSITIONS.get(current, set()))
