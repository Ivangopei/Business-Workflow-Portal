from fastapi import APIRouter, HTTPException, status

from app import repositories
from app.db import get_connection
from app.schemas import ClientCreate

# Sign-in is required for every route here; main.py adds that guard to the router.
router = APIRouter(prefix="/api/clients", tags=["clients"])


@router.get("")
def list_clients():
    with get_connection() as conn:
        return repositories.list_clients(conn)


@router.get("/{client_id}")
def get_client(client_id: int):
    with get_connection() as conn:
        client = repositories.get_client(conn, client_id)

    if client is None:
        raise HTTPException(status_code=404, detail="Client not found.")
    return client


@router.post("", status_code=status.HTTP_201_CREATED)
def create_client(client: ClientCreate):
    # `client` has already passed every rule in schemas.ClientCreate by the time we get here.
    with get_connection() as conn:
        return repositories.create_client(conn, client)
