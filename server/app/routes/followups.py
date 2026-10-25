from fastapi import APIRouter

from app.db import get_connection

router = APIRouter(prefix="/api/followups", tags=["followups"])


@router.get("")
def list_follow_ups():
    query = """
        SELECT
            f.id,
            f.subject,
            f.method,
            f.due_at,
            f.completed_at,
            ct.name AS contact,
            ct.last_contacted_on,
            c.name  AS company,
            CASE
                WHEN f.completed_at IS NOT NULL         THEN 'completed'
                WHEN f.due_at::date < CURRENT_DATE      THEN 'overdue'
                WHEN f.due_at::date = CURRENT_DATE      THEN 'today'
                WHEN f.due_at::date < CURRENT_DATE + 7  THEN 'this-week'
                ELSE 'later'
            END AS "group"
        FROM follow_ups f
        JOIN contacts ct ON ct.id = f.contact_id
        JOIN clients c   ON c.id  = ct.client_id
        ORDER BY f.due_at
    """

    with get_connection() as conn:
        follow_ups = conn.execute(query).fetchall()

    return follow_ups