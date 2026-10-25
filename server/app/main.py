from fastapi import FastAPI

from app.routes import tasks
from app.routes import clients
from app.routes import contacts
from app.routes import projects
from app.routes import followups
from app.routes import documents

app = FastAPI(title="Atlas API")

app.include_router(tasks.router)
app.include_router(clients.router)
app.include_router(contacts.router)
app.include_router(projects.router)
app.include_router(followups.router)
app.include_router(documents.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}