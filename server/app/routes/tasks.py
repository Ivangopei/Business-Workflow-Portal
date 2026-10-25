from fastapi import APIRouter

from app.db import get_connection

router = APIRouter(prefix="/api/tasks", tags=["tasks"]) # initializes the router with a prefix and tags. All routes in this file will start with /api/tasks and be tagged as "tasks" in the OpenAPI docs


@router.get("") # defines a GET endpoint at /api/tasks. This will return a list of tasks.
def list_tasks():
    query = """
        SELECT
            t.id,
            t.title,
            t.status,
            t.priority,
            t.due_date,
            c.name  AS client,
            p.name  AS project,
            ct.name AS waiting_on,
            (t.due_date < CURRENT_DATE AND t.status <> 'done') AS overdue
        FROM tasks t
        JOIN clients c        ON c.id  = t.client_id
        LEFT JOIN projects p  ON p.id  = t.project_id
        LEFT JOIN contacts ct ON ct.id = t.waiting_on_contact_id
        ORDER BY t.due_date
    """

    with get_connection() as conn: # opens and closes a connection to the database. The connection is automatically closed when the block is exited.
        tasks = conn.execute(query).fetchall() # executes the SQL query and fetches all results. Each row is returned as a dictionary because of the dict_row row factory.

    return tasks