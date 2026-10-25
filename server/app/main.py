from fastapi import FastAPI

from app.db import get_connection
from app.routes import clients, contacts, documents, followups, projects, tasks

app = FastAPI(title="Atlas API")

app.include_router(clients.router)
app.include_router(contacts.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(followups.router)
app.include_router(documents.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/health/db")
def health_db():
    with get_connection() as conn:
        conn.execute("SELECT 1")
    return {"database": "ok"}