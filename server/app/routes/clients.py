from fastapi import APIRouter

from app.db import get_connection

router = APIRouter(prefix="/api/clients", tags=["clients"])


@router.get("")
def list_clients():
    query = """
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
            string_agg(DISTINCT p.program, ', ') AS programs,
            (SELECT COUNT(*)
               FROM tasks t
              WHERE t.client_id = c.id AND t.status <> 'done') AS open_tasks
        FROM clients c
        LEFT JOIN contacts ct ON ct.client_id = c.id AND ct.is_primary
        LEFT JOIN projects p  ON p.client_id = c.id
        GROUP BY c.id, ct.name, ct.email, ct.phone
        ORDER BY c.name
    """

    with get_connection() as conn:
        clients = conn.execute(query).fetchall()

    return clients