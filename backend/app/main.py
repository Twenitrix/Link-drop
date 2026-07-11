# main.py — The entry point. Creates the FastAPI app and wires everything together.
#
# Three things happen here:
#   1. App is created with metadata (shows up in /docs)
#   2. CORS middleware is added (security — controls who can call your API)
#   3. Routers are included (all the actual endpoints)
#
# Run with:  uvicorn app.main:app --reload
# Docs at:   http://localhost:8000/docs

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, links, redirect

# Create all DB tables on startup (equivalent to running CREATE TABLE if not exists)
# In production, you'd use Alembic migrations instead for safer schema changes
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LinkDrop API",
    description="A URL shortener with authentication",
    version="1.0.0",
    docs_url="/docs",        # Interactive API explorer — visit this in your browser!
    redoc_url="/redoc",      # Alternative docs format
)

# ─── CORS Middleware ───────────────────────────────────────────────────────────
# CORS = Cross-Origin Resource Sharing
# Browsers block JavaScript on domain A from calling an API on domain B
# UNLESS the API explicitly says "yes, I allow domain A"
#
# allow_origins: only your frontend URL. In prod, set this to your actual domain.
# allow_credentials: needed if you use cookies (we use JWT headers, but keep it True)
# allow_methods/headers: ["*"] means allow everything

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # Create React App dev server (if you switch)
        # In prod: "https://linkdrop.yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register routers ─────────────────────────────────────────────────────────
# Order matters! redirect.router goes LAST because /{short_code} is a wildcard
# that would swallow /api/* if registered first.

app.include_router(auth.router)          # /api/auth/*
app.include_router(links.router)         # /api/links/*
app.include_router(redirect.router)      # /{short_code}  ← wildcard, must be last


# ─── Health check ─────────────────────────────────────────────────────────────
# Used by Docker, load balancers, and monitoring to check if the app is alive

@app.get("/api/health", tags=["meta"])
def health_check():
    return {"status": "ok", "service": "linkdrop-api"}
