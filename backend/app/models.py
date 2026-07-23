# models.py — Defines what your DATABASE TABLES look like
#
# Each class here = one table in the database.
# SQLAlchemy maps Python objects to rows in those tables.
#
# When you do:
#   user = User(email="dev@tcet.ac.in", ...)
#   db.add(user)
#   db.commit()
# SQLAlchemy runs: INSERT INTO users (email, ...) VALUES ("dev@tcet.ac.in", ...)

from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    # NEVER store plain passwords. Only the bcrypt hash. See auth.py.
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # SQLAlchemy relationship — not a real DB column.
    # Just lets you write: user.links  and get all their links
    # back_populates="owner" means Link also has a .owner that points back here
    links: Mapped[List["Link"]] = relationship("Link", back_populates="owner", cascade="all, delete")


class Link(Base):
    __tablename__ = "links"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    original_url: Mapped[str] = mapped_column(String, nullable=False)
    short_code: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    clicks: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # ForeignKey links this row to a User row
    # If user is deleted, their links are deleted too (cascade on the User side)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    owner: Mapped["User"] = relationship("User", back_populates="links")
