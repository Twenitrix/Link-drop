from __future__ import annotations
# crud.py — All database operations
#
# CRUD = Create, Read, Update, Delete
# This file is ONLY about talking to the database.
# No HTTP logic. No request/response. Just pure DB functions.
#
# Why separate from routes?
#   Testability: you can test DB logic without spinning up an HTTP server
#   Reusability: multiple routes can call the same CRUD function
#   Clarity: routes handle HTTP, crud handles DB — clear separation

import random
import string
from sqlalchemy.orm import Session
from . import models, schemas
from .auth import hash_password


# ─── User CRUD ────────────────────────────────────────────────────────────────

def get_user_by_email(db: Session, email: str) -> models.User | None:
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> models.User | None:
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> models.User | None:
    return db.query(models.User).filter(models.User.username == username).first()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hash_password(user.password),
        # Note: we hash the password here, never store the plain text
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)  # refresh reads back the auto-generated id, created_at, etc.
    return db_user


# ─── Link CRUD ────────────────────────────────────────────────────────────────

def _generate_short_code(length: int = 7) -> str:
    """Generate a random alphanumeric code like 'aB3xK9m'"""
    chars = string.ascii_letters + string.digits
    return ''.join(random.choices(chars, k=length))


def create_link(db: Session, link: schemas.LinkCreate, owner_id: int) -> models.Link:
    if link.custom_code:
        code = link.custom_code
    else:
        # Keep generating codes until we find one that doesn't exist
        # Collision is astronomically unlikely with 7 chars but we check anyway
        for _ in range(10):  # max 10 attempts
            code = _generate_short_code()
            if not db.query(models.Link).filter(models.Link.short_code == code).first():
                break
        else:
            raise RuntimeError("Failed to generate unique short code")

    db_link = models.Link(
        original_url=link.original_url,
        short_code=code,
        title=link.title,
        owner_id=owner_id,
        expires_at=link.expires_at,
    )
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link


def get_user_links(db: Session, owner_id: int) -> list[models.Link]:
    return (
        db.query(models.Link)
        .filter(models.Link.owner_id == owner_id)
        .order_by(models.Link.created_at.desc())  # newest first
        .all()
    )


def get_link_by_code(db: Session, short_code: str) -> models.Link | None:
    return db.query(models.Link).filter(models.Link.short_code == short_code).first()


def increment_clicks(db: Session, link: models.Link) -> models.Link:
    link.clicks += 1
    db.commit()
    db.refresh(link)
    return link


def delete_link(db: Session, link_id: int, owner_id: int) -> models.Link | None:
    """Delete a link — only if it belongs to owner_id (prevents other users deleting your links)"""
    link = (
        db.query(models.Link)
        .filter(models.Link.id == link_id, models.Link.owner_id == owner_id)
        .first()
    )
    if link:
        db.delete(link)
        db.commit()
    return link
