"""Data-access helper for the Atlas API.

Architecture note: the backend is layered.
  - Routes   (app/routes/*.py) handle HTTP: URLs, status codes, JSON.
  - Database (this file) is the only place that knows how to connect to PostgreSQL.
Routes ask this module for a connection instead of building one themselves, so
the connection details live in one place and tests can swap in a fake.
"""

import os

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

# Read the settings in server/.env into environment variables
load_dotenv()


class DatabaseNotConfiguredError(RuntimeError):
    """Raised when DATABASE_URL is missing, so the API can explain the problem."""


def get_database_url() -> str:
    """Return DATABASE_URL, or raise a clear error if it isn't set.

    This is read when a connection is needed (not when the module is imported),
    so the app can still start, and tests can run, without a real database.
    """
    url = os.getenv("DATABASE_URL")
    if not url:
        raise DatabaseNotConfiguredError(
            "DATABASE_URL is not set. Copy server/.env.example to server/.env and fill it in."
        )
    return url


def get_connection():
    """Open a new connection to PostgreSQL.

    row_factory=dict_row makes every row come back as a dictionary,
    like {"id": 1, "title": "..."}, instead of a plain tuple.
    """
    return psycopg.connect(get_database_url(), row_factory=dict_row)
