"""
Firebase Authentication Middleware
------------------------------------
get_current_user          → requires valid token, raises 401 if missing/invalid
get_current_user_optional → returns user dict if token present, None if not
"""

from typing import Optional

import firebase_admin
from firebase_admin import auth, credentials
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from core.config import FIREBASE_CREDENTIALS_PATH, FIREBASE_PROJECT_ID


# ── Init Firebase Admin SDK once ──────────────────────────────────────────────
def _init_firebase() -> None:
    if firebase_admin._apps:
        return
    try:
        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    except Exception:
        cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred, {"projectId": FIREBASE_PROJECT_ID})


_init_firebase()

_bearer_required = HTTPBearer(auto_error=True)
_bearer_optional = HTTPBearer(auto_error=False)


# ── Required auth ─────────────────────────────────────────────────────────────
def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(_bearer_required),
) -> dict:
    """Raises 401 if no valid token is provided."""
    return _verify_token(creds.credentials)


# ── Optional auth ─────────────────────────────────────────────────────────────
def get_current_user_optional(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_optional),
) -> Optional[dict]:
    """Returns decoded token dict if valid token present, otherwise None."""
    if not creds:
        return None
    try:
        return _verify_token(creds.credentials)
    except HTTPException:
        return None


# ── Shared verification logic ─────────────────────────────────────────────────
def _verify_token(token: str) -> dict:
    try:
        return auth.verify_id_token(token)
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please sign in again.",
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {exc}",
        )