from fastapi import FastAPI

from app.routes import tasks
from app.routes import clients

app = FastAPI(title="Atlas API")

app.include_router(tasks.router)
app.include_router(clients.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}