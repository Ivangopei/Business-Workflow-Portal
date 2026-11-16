import logging

import psycopg
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.db import DatabaseNotConfiguredError, get_connection
from app.routes import clients, contacts, documents, followups, projects, tasks

logger = logging.getLogger("atlas")

app = FastAPI(title="Atlas API")

app.include_router(clients.router)
app.include_router(contacts.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(followups.router)
app.include_router(documents.router)


# Error handling: if the database is down or not configured, every route would
# otherwise crash with a generic 500 and a stack trace. These handlers turn those
# failures into a 503 "Service Unavailable" with a short, safe JSON message.
@app.exception_handler(psycopg.OperationalError)
def database_unavailable(request: Request, exc: psycopg.OperationalError):
    logger.error("Database error on %s: %s", request.url.path, exc)
    return JSONResponse(status_code=503, content={"detail": "Database is unavailable. Try again later."})


@app.exception_handler(DatabaseNotConfiguredError)
def database_not_configured(request: Request, exc: DatabaseNotConfiguredError):
    logger.error("Database not configured: %s", exc)
    return JSONResponse(status_code=503, content={"detail": "Database is not configured."})


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/health/db")
def health_db():
    with get_connection() as conn:
        conn.execute("SELECT 1")
    return {"database": "ok"}
