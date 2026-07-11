# routers/redirect.py — /{short_code} endpoint
#
# This is the CORE feature of a URL shortener.
# Someone visits linkdrop.dev/aB3xK9m → they get redirected to the original URL.
#
# This is PUBLIC — no auth required.
# Anyone with the short URL should be able to use it.
#
# IMPORTANT: This router must be registered LAST in main.py
# because /{short_code} is a wildcard route that would catch everything,
# including /docs and /api/* if registered first.

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from .. import crud
from ..database import get_db

router = APIRouter(tags=["redirect"])


@router.get("/{short_code}")
def redirect_to_url(short_code: str, db: Session = Depends(get_db)):
    """
    The money endpoint. Lookup short_code in DB, redirect to original URL.
    
    HTTP 307 = Temporary Redirect (keeps the HTTP method)
    HTTP 301 = Permanent Redirect (browsers cache it — avoid for URL shorteners
               because if you delete the link, users' browsers still redirect)
    """
    link = crud.get_link_by_code(db, short_code=short_code)

    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Short link '{short_code}' not found or has been deleted"
        )

    # Increment click counter (fire and forget — we don't return the updated count)
    crud.increment_clicks(db, link)

    return RedirectResponse(url=link.original_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)
