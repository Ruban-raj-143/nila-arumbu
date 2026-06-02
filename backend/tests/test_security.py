"""
Nila Arumbu — Security Unit Tests
Tests JWT creation/verification and password hashing.
"""
import pytest
from datetime import timedelta
from app.core.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)
from fastapi import HTTPException


class TestPasswordHashing:
    def test_hash_is_not_plaintext(self):
        hashed = hash_password("secret123")
        assert hashed != "secret123"

    def test_correct_password_verifies(self):
        hashed = hash_password("secret123")
        assert verify_password("secret123", hashed) is True

    def test_wrong_password_fails(self):
        hashed = hash_password("secret123")
        assert verify_password("wrong", hashed) is False

    def test_same_password_different_hashes(self):
        h1 = hash_password("secret123")
        h2 = hash_password("secret123")
        assert h1 != h2  # bcrypt uses random salt


class TestJWT:
    def test_token_encodes_and_decodes(self):
        token = create_access_token("user-uuid-123", "ANGANWADI_WORKER")
        payload = decode_token(token)
        assert payload.sub == "user-uuid-123"
        assert payload.role == "ANGANWADI_WORKER"

    def test_expired_token_raises_http_401(self):
        token = create_access_token(
            "user-uuid-123", "WORKER", expires_delta=timedelta(seconds=-1)
        )
        with pytest.raises(HTTPException) as exc_info:
            decode_token(token)
        assert exc_info.value.status_code == 401

    def test_tampered_token_raises_http_401(self):
        token = create_access_token("user-uuid-123", "WORKER")
        tampered = token[:-5] + "XXXXX"
        with pytest.raises(HTTPException) as exc_info:
            decode_token(tampered)
        assert exc_info.value.status_code == 401

    def test_role_is_preserved_in_token(self):
        for role in ("ANGANWADI_WORKER", "SUPERVISOR", "STATE_ADMIN"):
            token = create_access_token("uid", role)
            payload = decode_token(token)
            assert payload.role == role
