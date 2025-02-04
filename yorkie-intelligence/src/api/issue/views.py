from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from langchain_core.output_parsers import StrOutputParser

from src.common.llms import get_model
from .config import issue_template_prompt


router = APIRouter()


@router.get("/create")
async def make_issue(query: str, llm=Depends(get_model)):
    chain = issue_template_prompt | llm | StrOutputParser()

    async def event_stream():
        try:
            async for chunk in chain.astream(query):
                yield f"data: {chunk}\n\n"
        except Exception as e:
            yield f"data: {str(e)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
