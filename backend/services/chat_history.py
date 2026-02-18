"""
Chat History Service  (Firestore-backed)
-----------------------------------------
Firestore schema:

  chat_sessions/{user_uid}/messages/{auto_id}
    ├── role:       "user" | "assistant"
    ├── content:    str
    ├── sources:    list[str]   (only on assistant messages)
    └── timestamp:  server timestamp

Each user gets their own sub-collection, so history is isolated per account.
"""

from datetime import datetime, timezone
from typing import List

from firebase_admin import firestore
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

from core.config import FIREBASE_PROJECT_ID


# ── Firestore client (reused across requests) ─────────────────────────────────
def _db():
    return firestore.client()


# ── Public helpers ─────────────────────────────────────────────────────────────

def save_message(
    user_uid: str,
    role: str,
    content: str,
    sources: List[str] | None = None,
) -> str:
    """
    Persist a single message to Firestore.
    Returns the auto-generated document ID.
    """
    doc_ref = (
        _db()
        .collection("chat_sessions")
        .document(user_uid)
        .collection("messages")
        .document()           # auto-ID
    )
    payload = {
        "role":      role,
        "content":   content,
        "timestamp": SERVER_TIMESTAMP,
    }
    if sources is not None:
        payload["sources"] = sources

    doc_ref.set(payload)
    return doc_ref.id


def get_history(user_uid: str, limit: int = 50) -> List[dict]:
    """
    Fetch the most recent `limit` messages for a user, ordered oldest-first.
    """
    docs = (
        _db()
        .collection("chat_sessions")
        .document(user_uid)
        .collection("messages")
        .order_by("timestamp")
        .limit_to_last(limit)   # newest N, then reversed to oldest-first
        .get()
    )
    return [
        {
            "id":        doc.id,
            "role":      doc.get("role"),
            "content":   doc.get("content"),
            "sources":   doc.get("sources", []),
            "timestamp": doc.get("timestamp"),
        }
        for doc in docs
    ]


def clear_history(user_uid: str) -> int:
    """
    Delete all messages for a user.
    Returns the number of messages deleted.
    """
    col_ref = (
        _db()
        .collection("chat_sessions")
        .document(user_uid)
        .collection("messages")
    )
    docs  = col_ref.list_documents()
    batch = _db().batch()
    count = 0
    for doc in docs:
        batch.delete(doc)
        count += 1
    batch.commit()
    return count