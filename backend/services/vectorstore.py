import chromadb
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from core.config import (
    GOOGLE_API_KEY, CHROMA_API_KEY, CHROMA_TENANT,
    CHROMA_DATABASE, EMBEDDING_MODEL, COLLECTION_NAME,
)


def get_embeddings() -> GoogleGenerativeAIEmbeddings:
    return GoogleGenerativeAIEmbeddings(
        model=EMBEDDING_MODEL,
        google_api_key=GOOGLE_API_KEY,
    )


def get_chroma_client() -> chromadb.HttpClient:
    return chromadb.HttpClient(
        host="https://api.trychroma.com",
        headers={
            "Authorization": f"Bearer {CHROMA_API_KEY}",
            "x-chroma-token": CHROMA_API_KEY,
        },
        tenant=CHROMA_TENANT,
        database=CHROMA_DATABASE,
    )


def get_vectorstore() -> Chroma:
    return Chroma(
        client=get_chroma_client(),
        collection_name=COLLECTION_NAME,
        embedding_function=get_embeddings(),
    )


def get_session_retriever(session_id: str, k: int = 3):
    """
    Returns a retriever that only searches chunks tagged with the given session_id.
    """
    vectorstore = get_vectorstore()
    return vectorstore.as_retriever(
        search_kwargs={
            "k": k,
            "filter": {"session_id": session_id},
        }
    )