"""Tests for ATL-1: Sign in.

Acceptance criteria being checked:
  - Correct email and password sign you in; wrong ones show an error.
  - Any API route without a valid login returns 401.
"""

from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from app import main, repositories
from app.routes import auth
from app.security import create_access_token, hash_password, verify_password

SECRET = "test-secret-that-is-long-enough-for-hs256-signing"
PASSWORD = "CorrectHorse!42"
USER = {"id": 1, "email": "demo@atlas.test", "name": "Demo", "password_hash": hash_password(PASSWORD)}


class FakeConnection:
    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", SECRET)
    monkeypatch.setenv("SKIP_DB_INIT", "1")
    monkeypatch.setattr(auth, "get_connection", lambda: FakeConnection())
    # Only demo@atlas.test exists in this fake "database".
    monkeypatch.setattr(
        repositories, "find_user_by_email",
        lambda conn, email: USER if email == USER["email"] else None,
    )
    monkeypatch.setattr(
        repositories, "find_user_by_id",
        lambda conn, user_id: {k: USER[k] for k in ("id", "email", "name")} if user_id == 1 else None,
    )
    return TestClient(main.app)


# --- password hashing -------------------------------------------------------

def test_password_is_hashed_not_stored_as_plain_text():
    hashed = hash_password(PASSWORD)
    assert hashed != PASSWORD
    assert verify_password(PASSWORD, hashed)


def test_wrong_password_does_not_verify():
    assert not verify_password("wrong", hash_password(PASSWORD))


def test_malformed_hash_fails_instead_of_crashing():
    assert verify_password(PASSWORD, "not-a-bcrypt-hash") is False


# --- login endpoint ----------------------------------------------------------

def test_login_with_correct_credentials_returns_token_and_user(client):
    response = client.post("/api/auth/login", json={"email": "demo@atlas.test", "password": PASSWORD})

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"] == {"id": 1, "email": "demo@atlas.test", "name": "Demo"}
    assert "password_hash" not in response.text


def test_login_email_is_not_case_sensitive(client):
    response = client.post("/api/auth/login", json={"email": "  Demo@Atlas.TEST ", "password": PASSWORD})
    assert response.status_code == 200


def test_login_with_wrong_password_returns_401(client):
    response = client.post("/api/auth/login", json={"email": "demo@atlas.test", "password": "nope"})
    assert response.status_code == 401
    assert response.json() == {"detail": "Incorrect email or password."}


def test_login_with_unknown_email_gives_the_same_error(client):
    response = client.post("/api/auth/login", json={"email": "nobody@atlas.test", "password": PASSWORD})
    assert response.status_code == 401
    assert response.json() == {"detail": "Incorrect email or password."}


def test_login_with_missing_fields_returns_422(client):
    assert client.post("/api/auth/login", json={"email": "demo@atlas.test"}).status_code == 422


# --- protected routes ----------------------------------------------------------

@pytest.mark.parametrize("path", [
    "/api/clients", "/api/tasks", "/api/projects", "/api/contacts",
    "/api/followups", "/api/documents", "/api/auth/me",
])
def test_protected_routes_return_401_without_a_token(client, path):
    response = client.get(path)
    assert response.status_code == 401
    assert response.json() == {"detail": "Not signed in."}


def test_forged_token_is_rejected(client):
    response = client.get("/api/clients", headers={"Authorization": "Bearer not.a.real.token"})
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid login token."}


def test_expired_token_is_rejected(client):
    long_ago = datetime.now(timezone.utc) - timedelta(days=2)
    token = create_access_token(1, "demo@atlas.test", now=long_ago)

    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401
    assert "expired" in response.json()["detail"]


def test_me_returns_signed_in_user(client):
    token = client.post("/api/auth/login", json={"email": "demo@atlas.test", "password": PASSWORD}).json()["access_token"]

    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json() == {"id": 1, "email": "demo@atlas.test", "name": "Demo"}


def test_health_check_stays_public(client):
    assert client.get("/api/health").status_code == 200
