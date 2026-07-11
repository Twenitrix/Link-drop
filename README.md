# LinkDrop 🔗

A URL shortener with authentication. Built with FastAPI + React.

## Stack

| Layer     | Tech                              | Why                               |
|-----------|-----------------------------------|-----------------------------------|
| Frontend  | React + TypeScript + Vite         | Component-based UI, fast dev      |
| Backend   | FastAPI + Python                  | Fast, typed, auto /docs           |
| Database  | SQLite (dev) / PostgreSQL (prod)  | SQLite = zero setup for learning  |
| Auth      | JWT + bcrypt                      | Stateless, secure                 |
| Routing   | React Router v6                   | Client-side navigation            |
| HTTP      | Axios                             | Interceptors for auth headers     |

---

## Run it locally (dev, no Docker)

### 1. Backend

```bash
cd backend

# Create a virtual environment (isolates Python packages from your system)
python -m venv venv

# Activate it
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# NOTE: If you encounter an error with `bcrypt` (e.g. ValueError: password cannot be longer than 72 bytes)
# during registration/login due to newer bcrypt versions conflicting with passlib, run:
# pip install "bcrypt<4.0.0"

# Run the server
uvicorn app.main:app --reload
```

> [!NOTE]
> **Python Compatibility Note**: If you are running Python 3.9 or below, we have pre-configured `app/crud.py` to import `from __future__ import annotations` so that modern union type hints (`models.User | None`) function correctly without runtime errors.

Backend is now running at **http://localhost:8000**

Visit **http://localhost:8000/docs** — you get a full interactive API explorer for FREE. Try all endpoints from your browser without writing a single line of frontend code. This is one of FastAPI's superpowers.

### 2. Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend is now at **http://localhost:5173**

---

## Project structure

```
linkdrop/
├── backend/
│   └── app/
│       ├── main.py          ← FastAPI app, CORS, router registration
│       ├── database.py      ← SQLAlchemy engine + get_db() dependency
│       ├── models.py        ← DB table definitions (User, Link)
│       ├── schemas.py       ← Pydantic request/response shapes
│       ├── auth.py          ← JWT creation/verification, bcrypt, get_current_user
│       ├── crud.py          ← All database operations (no HTTP logic here)
│       └── routers/
│           ├── auth.py      ← POST /api/auth/register, POST /api/auth/login
│           ├── links.py     ← GET/POST/DELETE /api/links/  (🔒 protected)
│           └── redirect.py  ← GET /{short_code}  (public — the actual redirect)
│
└── frontend/
    └── src/
        ├── App.tsx          ← Router setup + ProtectedRoute component
        ├── api/
        │   └── client.ts    ← Axios instance + auth interceptors + typed API fns
        └── pages/
            ├── Login.tsx    ← Login form
            ├── Register.tsx ← Registration form
            └── Dashboard.tsx← Main app: create links, view/delete links
```

---

## How a request flows through the app

### Creating a short link (protected endpoint):

```
User fills form → Dashboard.tsx calls linksApi.create()
  → Axios adds "Authorization: Bearer <token>" header automatically
    → FastAPI receives POST /api/links/
      → Depends(get_current_user) runs
        → Decodes JWT, gets user_id
          → Fetches User from DB
            → crud.create_link() generates short_code, inserts into DB
              → Returns LinkOut schema
                → Axios receives JSON → setLinks([newLink, ...prev])
                  → React re-renders with new link card
```

### Redirecting a short link (public endpoint):

```
User visits /aB3xK9m
  → FastAPI GET /{short_code}
    → crud.get_link_by_code("aB3xK9m")
      → Found → increment clicks → 307 redirect to original_url
      → Not found → 404
```

---

## Security explained

| What                       | How                                              |
|----------------------------|--------------------------------------------------|
| Passwords                  | bcrypt hashed, never stored plain                |
| Authentication             | JWT tokens, expire in 60 min                     |
| Authorization              | `Depends(get_current_user)` on protected routes  |
| Input validation           | Pydantic rejects invalid data before it hits DB  |
| SQL injection              | SQLAlchemy ORM never builds raw SQL strings      |
| CORS                       | Only localhost:5173 allowed (update for prod)    |
| User enumeration           | Same error for "wrong email" and "wrong password"|
| Ownership check            | Delete only works if link.owner_id == your id    |

---

## What to build next (extend this project)

1. **Custom short codes** — let users pick `/my-link` instead of random `/aB3xK9m`
2. **Link expiry** — add `expires_at` column, return 410 Gone when expired
3. **QR codes** — generate QR for each short URL (use `qrcode` Python lib)
4. **Analytics** — store each click with timestamp, browser, country
5. **Rate limiting** — max 20 links per hour per user (use `slowapi`)
6. **Email verification** — send email on register, block unverified users
7. **Alembic migrations** — proper schema versioning instead of `create_all()`
8. **Deploy to Railway** — push backend to Railway, frontend to Vercel (free)

---

## Commands cheat sheet

```bash
# Backend
uvicorn app.main:app --reload          # start with hot reload
uvicorn app.main:app --host 0.0.0.0    # expose to network (for Docker)

# Frontend
npm run dev          # start dev server with HMR
npm run build        # build for production (outputs to dist/)
npm run preview      # preview the production build locally

# Docker (when you're ready)
docker-compose up --build              # build and start all services
docker-compose up -d                   # run in background
docker-compose logs -f backend         # watch backend logs
docker-compose down                    # stop everything
```
