"""
Retail RAG Chatbot – Backend Entry Point
========================================
Run locally:
    uvicorn main:app --reload

API Docs:
    http://localhost:8000/docs
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from core.config import validate_config
from routes.auth   import router as auth_router
from routes.chat   import router as chat_router
from routes.upload import router as upload_router

# ── Config guard ───────────────────────────────────────────────────────────────
validate_config()

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Retail RAG Chatbot API",
    description=(
        "Upload retail documents (PDF) and ask questions about them. "
        "Responses are grounded in the uploaded content via RAG."
    ),
    version="2.0.0",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [o.strip() for o in _raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://retail-document-chatbot(-[a-z0-9]+)*-awwniket47s-projects\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(chat_router)


# ── Utility routes ─────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return RedirectResponse(url="https://fastapi.tiangolo.com/img/favicon.png")


@app.get("/health", tags=["System"])
async def health():
    """Simple liveness probe."""
    return {"status": "ok"}