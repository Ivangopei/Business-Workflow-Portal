"""Unit tests for the Atlas API.

These tests don't need PostgreSQL. Each route gets its connection from
get_connection(), so the tests replace that function with a fake connection
that returns rows we choose. This checks the route layer (URLs, status codes,
JSON shape, error handling) on its own, separate from the database.

Run from the server/ folder:  python -m pytest
"""

import psycopg
import pytest
from fastapi.testclient import TestClient

from app import main
from app.db import DatabaseNotConfiguredError, get_database_url
from app.routes import clients, tasks


class FakeCursor:
    def __init__(self, rows):
        self._rows = rows

    def fetchall(self):
        return self._rows


class FakeConnection:
    """Stands in for a psycopg connection. Records the SQL it was asked to run."""

    def __init__(self, rows=None):
        self.rows = rows or []
        self.queries = []

    def execute(self, query, params=None):
        self.queries.append(query)
        return FakeCursor(self.rows)

    # Lets the fake be used in "with get_connection() as conn:"
    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


@pytest.fixture
def client():
    return TestClient(main.app)


def test_health_returns_ok(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_db_ok_when_database_answers(client, monkeypatch):
    fake = FakeConnection()
    monkeypatch.setattr(main, "get_connection", lambda: fake)

    response = client.get("/api/health/db")

    assert response.status_code == 200
    assert response.json() == {"database": "ok"}
    assert fake.queries == ["SELECT 1"]


def test_tasks_returns_rows_from_database(client, monkeypatch):
    rows = [
        {"id": 1, "title": "Call John Smith", "status": "todo", "priority": "high",
         "due_date": "2026-11-20", "client": "ABC Manufacturing", "project": None,
         "waiting_on": None, "overdue": False},
    ]
    monkeypatch.setattr(tasks, "get_connection", lambda: FakeConnection(rows))

    response = client.get("/api/tasks")

    assert response.status_code == 200
    assert response.json() == rows


def test_clients_returns_empty_list_when_no_clients(client, monkeypatch):
    monkeypatch.setattr(clients, "get_connection", lambda: FakeConnection([]))

    response = client.get("/api/clients")

    assert response.status_code == 200
    assert response.json() == []


def test_database_down_returns_503_not_500(client, monkeypatch):
    def broken_connection():
        raise psycopg.OperationalError("connection refused")

    monkeypatch.setattr(tasks, "get_connection", broken_connection)

    response = client.get("/api/tasks")

    assert response.status_code == 503
    assert response.json() == {"detail": "Database is unavailable. Try again later."}
    # The raw database error must not leak to the browser
    assert "connection refused" not in response.text


def test_missing_database_url_returns_503(client, monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)

    response = client.get("/api/health/db")

    assert response.status_code == 503
    assert response.json() == {"detail": "Database is not configured."}


def test_get_database_url_raises_clear_error_when_missing(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)

    with pytest.raises(DatabaseNotConfiguredError, match="DATABASE_URL is not set"):
        get_database_url()


def test_get_database_url_reads_environment(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pw@localhost:5432/atlas")
    assert get_database_url() == "postgresql://user:pw@localhost:5432/atlas"


def test_unknown_route_returns_404(client):
    assert client.get("/api/does-not-exist").status_code == 404
