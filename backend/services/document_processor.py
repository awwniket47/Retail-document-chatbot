import os
import tempfile
from typing import List

from fastapi import UploadFile, HTTPException
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from core.config import CHUNK_SIZE, CHUNK_OVERLAP

SUPPORTED_TYPES = {".pdf"}


def _validate_file(filename: str) -> None:
    """Raise 400 if the file extension is not supported."""
    ext = os.path.splitext(filename)[-1].lower()
    if ext not in SUPPORTED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Supported types: {SUPPORTED_TYPES}",
        )


def _load_pdf(content: bytes, filename: str) -> List[Document]:
    """Write bytes to a temp file, load with PyPDF, then clean up."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        loader = PyPDFLoader(tmp_path)
        docs = loader.load()
        for doc in docs:
            doc.metadata["source"] = filename
        return docs
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def _chunk_documents(documents: List[Document]) -> List[Document]:
    """Split documents into smaller, overlapping chunks."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )
    return splitter.split_documents(documents)


async def process_upload(file: UploadFile) -> List[Document]:
    """
    Validate, load, and chunk an uploaded file.
    Returns a list of Document chunks ready for embedding.
    """
    _validate_file(file.filename)
    content = await file.read()

    ext = os.path.splitext(file.filename)[-1].lower()
    if ext == ".pdf":
        raw_docs = _load_pdf(content, file.filename)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    return _chunk_documents(raw_docs)