from fastapi import APIRouter

from app.db import get_connection

router = APIRouter(prefix="/api/contacts", tags=["contacts"])


@router.get("")
def list_contacts():
    query = """
        SELECT
            ct.id,
            ct.name,
            ct.role,
            ct.email,
            ct.phone,
            ct.is_primary,
            ct.last_contacted_on,
            c.id   AS client_id,
            c.name AS company
        FROM contacts ct
        JOIN clients c ON c.id = ct.client_id
        ORDER BY c.name, ct.is_primary DESC, ct.name
    """

    with get_connection() as conn:
        contacts = conn.execute(query).fetchall()

    return contacts