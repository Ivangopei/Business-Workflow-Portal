"""Create the tables and dummy data on a brand-new database.

Runs automatically when the API starts (see main.py). If the `users` table
already exists it does nothing, so restarting the server never wipes data.

To rebuild the database from scratch by hand (this DELETES all data):
    python -m app.init_db --reset
"""

import logging
import sys
from pathlib import Path

from app.db import get_connection

logger = logging.getLogger("atlas")

DB_FOLDER = Path(__file__).resolve().parent.parent / "db"


def database_is_empty(conn) -> bool:
    row = conn.execute("SELECT to_regclass('public.users') AS users_table").fetchone()
    return row["users_table"] is None


def load_schema_and_seed(conn) -> None:
    for name in ("schema.sql", "seed.sql"):
        conn.execute((DB_FOLDER / name).read_text())


def init_db(reset: bool = False) -> bool:
    """Returns True if tables were created."""
    with get_connection() as conn:
        if not reset and not database_is_empty(conn):
            return False
        load_schema_and_seed(conn)
    logger.info("Database schema and seed data loaded.")
    return True


if __name__ == "__main__":
    created = init_db(reset="--reset" in sys.argv)
    print("Database created." if created else "Database already set up; nothing to do.")
