from fastapi import APIRouter, Depends, HTTPException

from app import repositories
from app.db import get_connection
from app.schemas import LoginRequest
from app.security import create_access_token, get_current_user, unauthorized, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
def login(credentials: LoginRequest):
    with get_connection() as conn:
        user = repositories.find_user_by_email(conn, credentials.email)

    # Same message for "no such email" and "wrong password", so the login form
    # can't be used to find out which emails have accounts.
    if user is None or not verify_password(credentials.password, user["password_hash"]):
        raise unauthorized("Incorrect email or password.")

    token = create_access_token(user["id"], user["email"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user["id"], "email": user["email"], "name": user["name"]},
    }


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    """Who is signed in. The React app calls this on load to check a saved token."""
    with get_connection() as conn:
        user = repositories.find_user_by_id(conn, current_user["id"])

    if user is None:
        # Token was valid but the account was deleted.
        raise HTTPException(status_code=401, detail="Account no longer exists.")
    return user
