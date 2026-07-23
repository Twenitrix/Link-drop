# routers/links.py — /api/links/* endpoints
#
# ALL endpoints here require authentication.
# The magic is: current_user: models.User = Depends(get_current_user)
#
# FastAPI sees that dependency, runs get_current_user automatically,
# and injects the User object into the function.
# If the token is missing/expired/invalid → auto 401 before your code runs.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(prefix="/api/links", tags=["links"])


@router.post("/", response_model=schemas.LinkOut, status_code=status.HTTP_201_CREATED)
def create_link(
    link: schemas.LinkCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),  # 🔒 protected
):
    """Create a new short link. Requires valid JWT token."""
    if link.custom_code:
        # Validate custom code format
        c_code = link.custom_code.strip()
        if len(c_code) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Custom short code must be at least 3 characters"
            )
        if not c_code.replace("-", "").replace("_", "").isalnum():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Custom short code must contain only alphanumeric characters, dashes, or underscores"
            )
        
        # Check collision
        existing = crud.get_link_by_code(db, short_code=c_code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Custom short code is already taken"
            )
        link.custom_code = c_code

    return crud.create_link(db, link, owner_id=current_user.id)


@router.get("/", response_model=List[schemas.LinkOut])
def get_my_links(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),  # 🔒 protected
):
    """Get all links for the logged-in user."""
    return crud.get_user_links(db, owner_id=current_user.id)


@router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),  # 🔒 protected
):
    """
    Delete a link.
    
    Security: crud.delete_link checks owner_id — you can only delete YOUR links.
    If you try to delete someone else's link, you get 404 (not 403).
    Returning 404 instead of 403 means an attacker can't tell if the link exists.
    """
    link = crud.delete_link(db, link_id=link_id, owner_id=current_user.id)
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link not found"
        )
    # 204 No Content — success, nothing to return
