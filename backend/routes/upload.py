from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from services.document_processor import process_upload
from services.vectorstore import get_vectorstore

router = APIRouter(prefix="/api/upload", tags=["Upload"])


class UploadResponse(BaseModel):
    message: str
    chunks_added: int
    filename: str


@router.post("", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    session_id: str = Form(...),
):
    """
    Upload a PDF document tagged with a session_id.
    Only chunks from this session will be used in chat.
    """
    try:
        chunks = await process_upload(file)

        # Tag every chunk with the session_id
        for chunk in chunks:
            chunk.metadata["session_id"] = session_id

        vectorstore = get_vectorstore()
        vectorstore.add_documents(documents=chunks)

        return UploadResponse(
            message="Document uploaded and indexed successfully.",
            chunks_added=len(chunks),
            filename=file.filename,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))