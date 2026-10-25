from fastapi import FastAPI

from app.routes import tasks

app = FastAPI(title="Atlas API")

app.include_router(tasks.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}