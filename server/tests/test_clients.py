"""Tests for ATL-2 (add and manage clients) and ATL-3 (put a client in programs).

The validation rules are tested directly on the ClientCreate model, and the
POST route is tested with a fake repository so no database is needed.
"""

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app import main, repositories
from app.routes import clients as clients_route
from app.schemas import ClientCreate
from app.security import get_current_user


# --- validation rules (schemas.ClientCreate) ----------------------------------

def test_valid_business_client():
    client = ClientCreate(name="ABC Manufacturing", type="business", industry="Manufacturing",
                          programs=["h2b", "eb3"])
    assert client.name == "ABC Manufacturing"
    assert client.industry == "Manufacturing"
    assert client.status == "onboarding"  # default


def test_name_is_required():
    with pytest.raises(ValidationError, match="Name is required"):
        ClientCreate(name="   ", type="business")


def test_type_is_required_and_must_be_known():
    with pytest.raises(ValidationError):
        ClientCreate(name="X")
    with pytest.raises(ValidationError):
        ClientCreate(name="X", type="company")


def test_industry_is_dropped_for_individuals():
    client = ClientCreate(name="Maria Lopez", type="individual", industry="Should not be saved")
    assert client.industry is None


def test_client_can_be_in_all_three_programs():
    client = ClientCreate(name="Global Foods", type="business", programs=["h2a", "h2b", "eb3"])
    assert client.programs == ["h2a", "h2b", "eb3"]


def test_duplicate_programs_are_removed():
    client = ClientCreate(name="Global Foods", type="business", programs=["h2a", "h2a", "eb3"])
    assert client.programs == ["h2a", "eb3"]


def test_unknown_program_is_rejected():
    with pytest.raises(ValidationError):
        ClientCreate(name="X", type="business", programs=["h1b"])


def test_blank_optional_fields_become_none():
    client = ClientCreate(name="X", type="business", location="   ", primary_contact="")
    assert client.location is None
    assert client.primary_contact is None


# --- POST /api/clients --------------------------------------------------------

class FakeConnection:
    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


@pytest.fixture
def api(monkeypatch):
    monkeypatch.setenv("SKIP_DB_INIT", "1")
    saved = []

    def fake_create(conn, client):
        saved.append(client)
        return {"id": 9, **client.model_dump(), "open_tasks": 0}

    monkeypatch.setattr(clients_route, "get_connection", lambda: FakeConnection())
    monkeypatch.setattr(repositories, "create_client", fake_create)
    main.app.dependency_overrides[get_current_user] = lambda: {"id": 1, "email": "demo@atlas.test"}
    yield TestClient(main.app), saved
    main.app.dependency_overrides.clear()


def test_post_creates_client_and_returns_201(api):
    http, saved = api
    response = http.post("/api/clients", json={
        "name": "Sunrise Dairy", "type": "business", "industry": "Dairy",
        "location": "Dover, DE", "programs": ["h2a", "eb3"],
    })

    assert response.status_code == 201
    assert response.json()["id"] == 9
    assert response.json()["programs"] == ["h2a", "eb3"]
    assert len(saved) == 1


def test_post_with_invalid_data_returns_422_and_saves_nothing(api):
    http, saved = api
    response = http.post("/api/clients", json={"name": "", "type": "business"})

    assert response.status_code == 422
    assert saved == []


def test_post_requires_sign_in(monkeypatch):
    monkeypatch.setenv("SKIP_DB_INIT", "1")
    main.app.dependency_overrides.clear()
    response = TestClient(main.app).post("/api/clients", json={"name": "X", "type": "business"})
    assert response.status_code == 401
