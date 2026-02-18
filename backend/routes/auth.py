"""
Auth Routes
-----------
These endpoints are lightweight — Firebase handles the heavy lifting
(sign-up, sign-in, password reset) on the client side via the Firebase JS SDK.

Here we expose:
  GET /api/auth/me   – verify token + return profile info
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from middleware.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class UserProfile(BaseModel):
    uid: str
    email: str | None = None
    name: str | None = None
    picture: str | None = None


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Verify the bearer token and return the authenticated user's profile.
    Clients can call this to validate their token is still active.
    """
    return UserProfile(
        uid     = current_user.get("uid", ""),
        email   = current_user.get("email"),
        name    = current_user.get("name"),
        picture = current_user.get("picture"),
    )