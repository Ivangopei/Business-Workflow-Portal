"""Repository pattern: all SQL for users and clients lives here.

Routes call these functions with an open connection instead of writing SQL
themselves. That keeps the route layer about HTTP (status codes, JSON) and
this layer about data, and it lets tests swap in a fake repository.
"""

from app.schemas import ClientCreate

# Shared SELECT so the list and a newly created client come back in the same shape.
CLIENT_SELECT = """
    SELECT
        c.id,
        c.name,
        c.type,
        c.industry,
        c.location,
        c.status,
        ct.name  AS primary_contact,
        ct.email AS primary_email,
        ct.phone AS primary_phone,
        COALESCE(
            (SELECT array_agg(cp.program ORDER BY cp.program)
               FROM client_programs cp
              WHERE cp.client_id = c.id),
            '{}'
        ) AS programs,
        (SELECT COUNT(*)
           FROM tasks t
          WHERE t.client_id = c.id AND t.status <> 'done') AS open_tasks
    FROM clients c
    LEFT JOIN contacts ct ON ct.client_id = c.id AND ct.is_primary
"""


def find_user_by_email(conn, email: str) -> dict | None:
    return conn.execute(
        "SELECT id, email, name, password_hash FROM users WHERE email = %s",
        (email,),
    ).fetchone()


def find_user_by_id(conn, user_id: int) -> dict | None:
    return conn.execute(
        "SELECT id, email, name FROM users WHERE id = %s",
        (user_id,),
    ).fetchone()


def list_clients(conn) -> list[dict]:
    return conn.execute(CLIENT_SELECT + " ORDER BY c.name").fetchall()


def get_client(conn, client_id: int) -> dict | None:
    return conn.execute(CLIENT_SELECT + " WHERE c.id = %s", (client_id,)).fetchone()


def create_client(conn, client: ClientCreate) -> dict:
    """Insert a client, its programs, and its primary contact in one transaction.

    `with conn.transaction()` means either every insert is saved or none are,
    so a failure halfway can't leave a client without its programs.
    """
    with conn.transaction():
        row = conn.execute(
            """
            INSERT INTO clients (name, type, industry, location, status)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
            """,
            (client.name, client.type, client.industry, client.location, client.status),
        ).fetchone()
        client_id = row["id"]

        for program in client.programs:
            conn.execute(
                "INSERT INTO client_programs (client_id, program) VALUES (%s, %s)",
                (client_id, program),
            )

        if client.primary_contact:
            conn.execute(
                "INSERT INTO contacts (client_id, name, is_primary) VALUES (%s, %s, true)",
                (client_id, client.primary_contact),
            )

    return get_client(conn, client_id)
