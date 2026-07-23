# auth.py — All security logic lives here
#
# Three things this file does:
#   1. Hash & verify passwords (bcrypt)
#   2. Create & decode JWT tokens
#   3. get_current_user dependency — used in protected routes
#
# HOW JWT AUTH WORKS (simplified):
#   Login:   user sends email+password
#            → backend verifies password hash
#            → backend creates a JWT token: {"sub": "42", "exp": 1234567890}
#            → token is SIGNED with SECRET_KEY (nobody can fake it without the key)
#            → token returned to frontend
#   Request: frontend sends: Authorization: Bearer <token>
#            → backend decodes token, checks signature
#            → extracts user ID ("sub" = subject = user id)
#            → fetches user from DB
#            → injects user into route function via Depends(get_current_user)

import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .database import get_db

# In production, load this from an env var — never hardcode in real code
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# This tells FastAPI that the token comes from the Authorization header
# tokenUrl = where to get the token (for the auto-generated /docs UI)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    """Turn 'mypassword123' into '$2b$12$...' (bcrypt hash)"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    """Check if a plain password matches a stored bcrypt hash"""
    try:
        return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


def create_access_token(user_id: int, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT token containing the user's ID"""
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    payload = {
        "sub": str(user_id),  # "sub" = subject (who this token is for)
        "exp": expire,        # "exp" = expiry time (auto-checked by jose)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    FastAPI dependency — use in any route that requires authentication:
        current_user: User = Depends(get_current_user)
    
    FastAPI automatically:
    1. Extracts the Bearer token from the Authorization header
    2. Passes it here
    3. Returns the User object (or raises 401 if invalid)
    """
    from . import crud  # local import to avoid circular imports

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials — please log in again",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    user = crud.get_user_by_id(db, user_id=user_id)
    if user is None:
        raise credentials_exception

    return user
