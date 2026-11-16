"""Atlas API entry point.

Architecture (layers, top to bottom):
  routes/        HTTP layer: URLs, status codes, JSON in/out
  schemas.py     Validation rules for incoming data (Pydantic models)
  security.py    Password hashing, login tokens, and the sign-in guard
  repositories.py / routes' SQL   Data layer: the only code that talks to PostgreSQL
  db.py          Opens database connections from DATABASE_URL

Design patterns used:
  - Layered architecture (above): each layer only calls the one below it.
  - Repository pattern (repositories.py): SQL is hidden behind plain functions.
  - Dependency injection (FastAPI Depends): the sign-in guard `get_current_user`
    is injected into routers, so protecting a route is one line, and tests can
    replace it.
"""

import logging
import os
from contextlib import asynccontextmanager

import psycopg
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.db import DatabaseNotConfiguredError, get_connection
from app.init_db import init_db
from app.routes import auth, clients, contacts, documents, followups, projects, tasks
from app.security import get_current_user

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("atlas")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # On a fresh database (e.g. the first deploy), create the tables and dummy data.
    # If the database isn't reachable yet, start anyway; /api/health/db will report it.
    if os.getenv("DATABASE_URL") and os.getenv("SKIP_DB_INIT") != "1":
        try:
            if init_db():
                logger.info("Fresh database: tables and seed data created.")
        except Exception as exc:  # noqa: BLE001 - startup must not crash on DB problems
            logger.error("Could not initialize the database: %s", exc)
    yield


app = FastAPI(title="Atlas API", lifespan=lifespan)

# Only needed if the frontend calls the API from a different domain.
# In production, Vercel forwards /api/* to this server, so requests are same-origin.
allowed_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
if allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Public routes: sign-in and health checks.
app.include_router(auth.router)

# Everything else requires a valid sign-in (ATL-1). No token -> 401.
require_login = [Depends(get_current_user)]
for router in (clients.router, contacts.router, projects.router, tasks.router,
               followups.router, documents.router):
    app.include_router(router, dependencies=require_login)


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
