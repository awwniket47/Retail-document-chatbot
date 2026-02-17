import os
import base64
import tempfile
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

# 1. Load Environment Variables
load_dotenv()

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")

# 2. Configuration (Using STABLE alias to fix 429 Quota errors)
# "models/gemini-flash-latest" points to the stable 1.5 Flash with better free limits
CHAT_MODEL = "models/gemini-flash-latest"      
EMBEDDING_MODEL = "models/gemini-embedding-001" 
PINECONE_INDEX_NAME = "retail-rag-gemini-3072" 

if not GOOGLE_API_KEY or not PINECONE_API_KEY:
    raise ValueError("❌ API Keys are missing! Check your .env file.")

app = FastAPI()

# 3. Pinecone Setup
pc = Pinecone(api_key=PINECONE_API_KEY)
existing_indexes = [index.name for index in pc.list_indexes()]

if PINECONE_INDEX_NAME not in existing_indexes:
    try:
        print(f"Creating new index: {PINECONE_INDEX_NAME}...")
        pc.create_index(
            name=PINECONE_INDEX_NAME,
            dimension=3072, 
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
    except Exception as e:
        print(f"Index creation skipped/failed: {e}")

# 4. Gemini Embeddings Setup
embeddings = GoogleGenerativeAIEmbeddings(
    model=EMBEDDING_MODEL, 
    google_api_key=GOOGLE_API_KEY
)

vectorstore = PineconeVectorStore(index_name=PINECONE_INDEX_NAME, embedding=embeddings)

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]

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
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        # Process Image
        elif file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            image_b64 = base64.b64encode(file_content).decode('utf-8')
            
            # Use the Chat Model for Vision
            vision_llm = ChatGoogleGenerativeAI(model=CHAT_MODEL, google_api_key=GOOGLE_API_KEY)
            
            msg = HumanMessage(content=[
                {"type": "text", "text": "Extract all text and data from this image."},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}
            ])
            res = vision_llm.invoke([msg])
            documents = [Document(page_content=res.content, metadata={"source": file.filename})]

        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        # Chunk and Embed
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(documents)
        vectorstore.add_documents(documents=splits)
        
        return {"message": "Success", "chunks_added": len(splits)}

    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Use the Chat Model
        llm = ChatGoogleGenerativeAI(model=CHAT_MODEL, google_api_key=GOOGLE_API_KEY)
        
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