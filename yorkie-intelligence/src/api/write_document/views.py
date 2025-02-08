from fastapi import APIRouter, Depends, Body
from fastapi.responses import StreamingResponse
from langchain_core.output_parsers import StrOutputParser

from src.common.llms import get_model
from .config import document_writing_template_prompt


router = APIRouter()


@router.post("/create")
async def write_documenet(query: str = Body(embed=True), llm=Depends(get_model)):
    chain = document_writing_template_prompt | llm | StrOutputParser()

    async def event_stream():
        try:
            async for chunk in chain.astream(query):
                yield chunk
        except Exception as e:
            yield f"\n\n{str(e)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
