"""Authentication helpers: password hashing, login tokens, and the route guard.

How sign-in works (ATL-1):
  1. POST /api/auth/login checks the email + password against the bcrypt hash in `users`.
  2. If they match, the API returns a signed JWT (JSON Web Token) that expires after a while.
  3. The React app sends that token on every request:  Authorization: Bearer <token>
  4. `get_current_user` (below) checks the token. Missing, expired, or forged -> 401.

`get_current_user` is a FastAPI dependency. Adding it to a router protects every route
in that router, so protection is declared in one place (see main.py) instead of repeated.
"""

import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

TOKEN_ALGORITHM = "HS256"
TOKEN_LIFETIME = timedelta(hours=8)  # about one work day

# auto_error=False so we can return our own clear 401 message instead of FastAPI's 403.
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        # A malformed hash in the database should fail the login, not crash the API.
        return False


def get_jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET is not set. Add it to server/.env.")
    return secret


def create_access_token(user_id: int, email: str, now: datetime | None = None) -> str:
    issued_at = now or datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": issued_at,
        "exp": issued_at + TOKEN_LIFETIME,
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=TOKEN_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Return the token's payload, or raise jwt.InvalidTokenError if it is bad or expired."""
    return jwt.decode(token, get_jwt_secret(), algorithms=[TOKEN_ALGORITHM])


def unauthorized(message: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=message,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    """Route guard. Returns {"id", "email"} for a valid token, otherwise raises 401."""
    if credentials is None:
        raise unauthorized("Not signed in.")

    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.ExpiredSignatureError:
        raise unauthorized("Your session expired. Please sign in again.")
    except jwt.InvalidTokenError:
        raise unauthorized("Invalid login token.")

    return {"id": int(payload["sub"]), "email": payload["email"]}
