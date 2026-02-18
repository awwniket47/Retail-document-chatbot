from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from middleware.auth import get_current_user_optional
from services.chat_service import answer_query
from services.chat_history import clear_history, get_history, save_message

router = APIRouter(prefix="/api/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    query: str
    session_id: str


class ChatResponse(BaseModel):
    answer: str
    sources: List[str]


class HistoryMessage(BaseModel):
    id: str
    role: str
    content: str
    sources: List[str]
    timestamp: str | None = None


class HistoryResponse(BaseModel):
    messages: List[HistoryMessage]


class ClearHistoryResponse(BaseModel):
    message: str
    deleted_count: int


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional),
):
    try:
        uid = current_user.get("uid") if current_user else None

        if uid:
            save_message(uid, role="user", content=request.query)

        # Pass session_id so only this session's docs are used
        answer, sources = answer_query(request.query, request.session_id)

        if uid:
            save_message(uid, role="assistant", content=answer, sources=sources)

        return ChatResponse(answer=answer, sources=sources)

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/history", response_model=HistoryResponse)
async def fetch_history(
    limit: int = 50,
    current_user: Optional[dict] = Depends(get_current_user_optional),
):
    if not current_user:
        return HistoryResponse(messages=[])
    uid = current_user["uid"]
    messages = get_history(uid, limit=limit)
    return HistoryResponse(
        messages=[
            HistoryMessage(
                id=m["id"],
                role=m["role"],
                content=m["content"],
                sources=m.get("sources", []),
                timestamp=str(m["timestamp"]) if m.get("timestamp") else None,
            )
            for m in messages
        ]
    )


@router.delete("/history", response_model=ClearHistoryResponse)
async def delete_history(current_user: Optional[dict] = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Login required to clear history.")
    uid = current_user["uid"]
    count = clear_history(uid)
    return ClearHistoryResponse(message="Chat history cleared.", deleted_count=count)