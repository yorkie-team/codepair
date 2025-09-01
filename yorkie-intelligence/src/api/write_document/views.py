from typing import Annotated
from fastapi import APIRouter, Depends, Body
from fastapi.responses import StreamingResponse
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory

from src.common.llms import get_model
from src.common.utils import get_by_session_id, generate_session_id
from .models import Query
from .config import document_writing_template_prompt, chat_template


router = APIRouter()


@router.post("/")
async def write_document(query: Query, llm=Depends(get_model)):
    content = {"content": query.content}

    if query.session_id is None:
        session_id = generate_session_id()
        _chain = document_writing_template_prompt | llm | StrOutputParser()
    else:
        session_id = query.session_id
        _chain = chat_template | llm | StrOutputParser()

    chain = RunnableWithMessageHistory(
        _chain,
        get_by_session_id,
        input_messages_key="content",
        history_messages_key="chat_history",
    )

    async def event_stream():
        yield f"{session_id}\n"
        try:
            async for chunk in chain.astream(
                content, config={"session_id": session_id}
            ):
                yield chunk
        except Exception as e:
            yield f"\n\n{str(e)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
