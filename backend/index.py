import os
import base64
import tempfile
import chromadb
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv

# 1. Load Environment Variables
load_dotenv()

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
CHROMA_API_KEY = os.environ.get("CHROMA_API_KEY")
CHROMA_TENANT = os.environ.get("CHROMA_TENANT")
CHROMA_DATABASE = os.environ.get("CHROMA_DATABASE")

# 2. Configuration
CHAT_MODEL = "models/gemini-flash-latest"      
EMBEDDING_MODEL = "models/gemini-embedding-001" 
COLLECTION_NAME = "retail_chatbot_collection"

if not GOOGLE_API_KEY or not CHROMA_API_KEY:
    raise ValueError("❌ Required API Keys (Google or Chroma) are missing!")

app = FastAPI()

# 3. Gemini Embeddings Setup
embeddings = GoogleGenerativeAIEmbeddings(
    model=EMBEDDING_MODEL, 
    google_api_key=GOOGLE_API_KEY
)

# 4. Chroma Cloud Connection Setup
# This replaces the local persist_directory logic
def get_chroma_client():
    return chromadb.HttpClient(
        host="https://api.trychroma.com",
        headers={
            "Authorization": f"Bearer {CHROMA_API_KEY}",
            "x-chroma-token": CHROMA_API_KEY  # ✅ Add this line
        },
        tenant=CHROMA_TENANT,
        database=CHROMA_DATABASE
    )

def get_vectorstore():
    client = get_chroma_client()
    return Chroma(
        client=client,
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings
    )

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
from fastapi.responses import RedirectResponse

@app.get("/")
async def root():
    """Redirects the root URL to the API documentation"""
    return {"message": "Retail Chatbot API is running. Use /docs for documentation."}

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    """Handles the browser's automatic favicon request to stop 404 logs"""
    return RedirectResponse(url="https://fastapi.tiangolo.com/img/favicon.png")


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_content = await file.read()
        documents = []

        # Process PDF
        if file.filename.endswith(".pdf"):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                temp_file.write(file_content)
                temp_path = temp_file.name
            
            try:
                loader = PyPDFLoader(temp_path)
                documents = loader.load()
                for doc in documents:
                    doc.metadata["source"] = file.filename
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        # Chunk and Upload to Cloud
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(documents)
        
        # ✅ Added to Cloud Collection
        vectorstore = get_vectorstore()
        vectorstore.add_documents(documents=splits)
        
        return {"message": "Success", "chunks_added": len(splits)}

    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        llm = ChatGoogleGenerativeAI(model=CHAT_MODEL, google_api_key=GOOGLE_API_KEY)
        
        # ✅ Retrieve from Cloud
        vectorstore = get_vectorstore()
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
        docs = retriever.invoke(request.query)
        
        if not docs:
             return {"answer": "I couldn't find any relevant documents to answer your question.", "sources": []}

        context = "\n".join([d.page_content for d in docs])
        prompt = f"Context:\n{context}\n\nQuestion: {request.query}\nAnswer:"
        
        res = llm.invoke(prompt)
        sources = list(set([d.metadata.get("source", "Unknown") for d in docs]))
        
        return {"answer": res.content, "sources": sources}

    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))