# schemas.py — Defines what the API REQUEST/RESPONSE bodies look like
#
# Difference between models.py and schemas.py:
#   models.py  = what the DATABASE looks like (SQLAlchemy)
#   schemas.py = what the API accepts/returns (Pydantic)
#
# Why separate? Because:
#   - You never want to return hashed_password in API responses
#   - You want to accept "password" in requests but store "hashed_password"
#   - The DB shape and API shape are different on purpose
#
# Pydantic automatically VALIDATES incoming data.
# If a request sends email="notanemail", FastAPI rejects it with a 422 error.
# You don't write that validation code — Pydantic does it for you.

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, HttpUrl, field_validator


# ─── Auth schemas ────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    """What we ACCEPT when someone registers"""
    email: EmailStr          # Pydantic validates this is a real email format
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if not v.isalnum():
            raise ValueError("Username must be alphanumeric only")
        return v.lower()

    @field_validator("password")
    @classmethod
    def password_strong(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserOut(BaseModel):
    """What we RETURN about a user (NO password, ever)"""
    id: int
    email: str
    username: str
    created_at: datetime

    model_config = {"from_attributes": True}  # lets Pydantic read SQLAlchemy objects


class LoginData(BaseModel):
    """What we ACCEPT for login"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """What we RETURN after successful login"""
    access_token: str
    token_type: str = "bearer"


# ─── Link schemas ─────────────────────────────────────────────────────────────

class LinkCreate(BaseModel):
    """What we ACCEPT when creating a short link"""
    original_url: str
    title: Optional[str] = None
    custom_code: Optional[str] = None
    expires_at: Optional[datetime] = None

    @field_validator("original_url")
    @classmethod
    def url_must_be_valid(cls, v: str) -> str:
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v


class LinkOut(BaseModel):
    """What we RETURN about a link"""
    id: int
    original_url: str
    short_code: str
    title: Optional[str]
    clicks: int
    created_at: datetime
    expires_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
