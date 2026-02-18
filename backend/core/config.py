import os
from dotenv import load_dotenv

load_dotenv()

# ── Google / Gemini ────────────────────────────────────────────────────────────
GOOGLE_API_KEY: str = os.environ.get("GOOGLE_API_KEY", "")

# ── ChromaDB Cloud ─────────────────────────────────────────────────────────────
CHROMA_API_KEY: str  = os.environ.get("CHROMA_API_KEY", "")
CHROMA_TENANT: str   = os.environ.get("CHROMA_TENANT", "")
CHROMA_DATABASE: str = os.environ.get("CHROMA_DATABASE", "")

# ── Firebase ───────────────────────────────────────────────────────────────────
FIREBASE_PROJECT_ID: str = os.environ.get("FIREBASE_PROJECT_ID", "")
FIREBASE_CREDENTIALS_PATH: str = os.environ.get(
    "FIREBASE_CREDENTIALS_PATH", "firebase_credentials.json"
)

# ── Model Names ────────────────────────────────────────────────────────────────
CHAT_MODEL      = "models/gemini-2.5-flash"  
EMBEDDING_MODEL = "models/gemini-embedding-001"

# ── Vector Store ───────────────────────────────────────────────────────────────
COLLECTION_NAME = "retail_chatbot_collection"

# ── RAG / Chunking ─────────────────────────────────────────────────────────────
CHUNK_SIZE    = 1000
CHUNK_OVERLAP = 200
RETRIEVER_K   = 3

# ── Validation ─────────────────────────────────────────────────────────────────
def validate_config() -> None:
    """Raise early if critical keys are missing."""
    missing = [
        name for name, val in {
            "GOOGLE_API_KEY": GOOGLE_API_KEY,
            "CHROMA_API_KEY": CHROMA_API_KEY,
            "CHROMA_TENANT":  CHROMA_TENANT,
            "CHROMA_DATABASE": CHROMA_DATABASE,
        }.items() if not val
    ]
    if missing:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing)}"
        )