# routers/auth.py — /api/auth/* endpoints
#
# Two endpoints:
#   POST /api/auth/register  — create account
#   POST /api/auth/login     — get JWT token
#
# Notice: NO auth required here (you're not logged in yet!)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..auth import verify_password, create_access_token
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Create a new account.
    
    FastAPI automatically:
    - Parses the JSON body into UserCreate schema
    - Validates email format, password length, username rules
    - Returns 422 with details if validation fails
    """
    # Check email not already taken
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )
    # Check username not already taken
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This username is taken"
        )
    
    new_user = crud.create_user(db, user)
    return new_user  # Pydantic converts User model → UserOut schema (no password field)


@router.post("/login", response_model=schemas.Token)
def login(data: schemas.LoginData, db: Session = Depends(get_db)):
    """
    Login and get a JWT access token.
    
    Security note: We return the SAME error for "user not found" and "wrong password".
    This prevents "user enumeration attacks" — where an attacker figures out which
    emails have accounts just by trying to log in.
    """
    user = crud.get_user_by_email(db, data.email)

    # Verify both existence AND password — same error message for both
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(user_id=user.id)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserOut)
def get_me(db: Session = Depends(get_db)):
    """Placeholder — see links.py for how protected routes work with Depends(get_current_user)"""
    pass
