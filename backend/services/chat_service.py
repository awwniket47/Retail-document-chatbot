from typing import List, Tuple

from langchain_google_genai import ChatGoogleGenerativeAI

from core.config import GOOGLE_API_KEY, CHAT_MODEL
from services.vectorstore import get_session_retriever

RAG_PROMPT_TEMPLATE = """\
You are a helpful retail document assistant.
Answer the user's question using ONLY the context provided below.
If the answer is not in the context, say "I don't have enough information in the \
uploaded documents to answer this question."

Context:
{context}

Question: {question}

Answer:"""


def _build_llm() -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(model=CHAT_MODEL, google_api_key=GOOGLE_API_KEY)


def answer_query(query: str, session_id: str) -> Tuple[str, List[str]]:
    """
    Run the RAG pipeline for a specific session.
    Only retrieves chunks uploaded in this session.
    """
    retriever = get_session_retriever(session_id)
    docs = retriever.invoke(query)

    if not docs:
        return (
            "I couldn't find any relevant documents for this session. Please upload a PDF first.",
            [],
        )

    context = "\n\n".join(d.page_content for d in docs)
    prompt  = RAG_PROMPT_TEMPLATE.format(context=context, question=query)

    llm      = _build_llm()
    response = llm.invoke(prompt)
    sources  = list({d.metadata.get("source", "Unknown") for d in docs})

    return response.content, sources