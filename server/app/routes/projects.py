from fastapi import APIRouter, HTTPException

from app.db import get_connection

router = APIRouter(prefix="/api/projects", tags=["projects"])

# Shared by both endpoints: one row per project, with counts calculated from its tasks
PROJECTS_QUERY = """
    SELECT
        p.id,
        p.name,
        p.program,
        p.status,
        c.id   AS client_id,
        c.name AS client,
        COUNT(t.id) AS total_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'done')    AS completed,
        COUNT(t.id) FILTER (WHERE t.status = 'waiting') AS waiting,
        COALESCE(
            ROUND(100.0 * COUNT(t.id) FILTER (WHERE t.status = 'done') / NULLIF(COUNT(t.id), 0)),
            0
        ) AS progress
    FROM projects p
    JOIN clients c      ON c.id = p.client_id
    LEFT JOIN tasks t   ON t.project_id = p.id
"""


@router.get("")
def list_projects():
    query = PROJECTS_QUERY + " GROUP BY p.id, c.id ORDER BY p.id"

    with get_connection() as conn:
        projects = conn.execute(query).fetchall()

    return projects


@router.get("/{project_id}")
def get_project(project_id: int):
    project_query = PROJECTS_QUERY + " WHERE p.id = %s GROUP BY p.id, c.id"

    tasks_query = """
        SELECT
            t.id,
            t.title,
            t.status,
            t.priority,
            t.due_date,
            ct.name AS waiting_on,
            (t.due_date < CURRENT_DATE AND t.status <> 'done') AS overdue
        FROM tasks t
        LEFT JOIN contacts ct ON ct.id = t.waiting_on_contact_id
        WHERE t.project_id = %s
        ORDER BY t.due_date
    """

    with get_connection() as conn:
        project = conn.execute(project_query, (project_id,)).fetchone()

        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")

        project["tasks"] = conn.execute(tasks_query, (project_id,)).fetchall()

    return project