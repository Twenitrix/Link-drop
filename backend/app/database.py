# database.py — One job: connect to the DB and give routes a session to use
#
# SQLAlchemy works like this:
#   engine     = the actual connection to PostgreSQL/SQLite
#   SessionLocal = a factory that creates DB sessions (think: "open a transaction")
#   Base       = the parent class all your DB models inherit from
#
# To switch from SQLite (dev) to PostgreSQL (prod), just change DATABASE_URL:
#   SQLite:     "sqlite:///./linkdrop.db"
#   PostgreSQL: "postgresql://user:password@localhost/linkdrop"

import os
from sqlalchemy import create_engine
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./linkdrop.db")

# connect_args is SQLite-only (allows multiple threads to use one connection)
# Remove it if you switch to PostgreSQL
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

# This is a FastAPI "dependency" — injected into route functions via Depends(get_db)
# It opens a DB session, yields it to the route, then closes it when done
# Even if the route throws an error, the finally block always closes the session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
