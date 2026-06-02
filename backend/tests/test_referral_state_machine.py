"""
Nila Arumbu — Referral State Machine Unit Tests
"""
import pytest
from app.core.exceptions import InvalidStateTransitionError
from app.domains.referral.state_machine import (
    ReferralState,
    get_allowed_transitions,
    validate_transition,
)


class TestValidTransitions:
    def test_identified_to_referred(self):
        actions = validate_transition(ReferralState.IDENTIFIED, ReferralState.REFERRED)
        assert isinstance(actions, list)

    def test_referred_to_appointment_pending(self):
        validate_transition(ReferralState.REFERRED, ReferralState.APPOINTMENT_PENDING)

    def test_appointment_pending_to_visited(self):
        validate_transition(ReferralState.APPOINTMENT_PENDING, ReferralState.VISITED)

    def test_appointment_pending_to_followup(self):
        validate_transition(ReferralState.APPOINTMENT_PENDING, ReferralState.FOLLOWUP)

    def test_visited_to_closed(self):
        validate_transition(ReferralState.VISITED, ReferralState.CLOSED)

    def test_followup_to_visited(self):
        validate_transition(ReferralState.FOLLOWUP, ReferralState.VISITED)

    def test_followup_to_closed(self):
        validate_transition(ReferralState.FOLLOWUP, ReferralState.CLOSED)


class TestInvalidTransitions:
    def test_cannot_skip_from_identified_to_visited(self):
        with pytest.raises(InvalidStateTransitionError):
            validate_transition(ReferralState.IDENTIFIED, ReferralState.VISITED)

    def test_cannot_reopen_closed_referral(self):
        with pytest.raises(InvalidStateTransitionError):
            validate_transition(ReferralState.CLOSED, ReferralState.IDENTIFIED)

    def test_cannot_go_backwards_from_visited_to_referred(self):
        with pytest.raises(InvalidStateTransitionError):
            validate_transition(ReferralState.VISITED, ReferralState.REFERRED)

    def test_closed_has_no_transitions(self):
        allowed = get_allowed_transitions(ReferralState.CLOSED)
        assert allowed == []


class TestAllowedTransitions:
    def test_identified_allows_only_referred(self):
        allowed = get_allowed_transitions(ReferralState.IDENTIFIED)
        assert allowed == [ReferralState.REFERRED]

    def test_followup_allows_visited_and_closed(self):
        allowed = get_allowed_transitions(ReferralState.FOLLOWUP)
        assert ReferralState.VISITED in allowed
        assert ReferralState.CLOSED in allowed
