from fastapi import FastAPI

from app.routes import tasks
from app.routes import clients
from app.routes import contacts
from app.routes import projects

app = FastAPI(title="Atlas API")

app.include_router(tasks.router)
app.include_router(clients.router)
app.include_router(contacts.router)
app.include_router(projects.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}