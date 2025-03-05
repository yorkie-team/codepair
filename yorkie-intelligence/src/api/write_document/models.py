from pydantic import BaseModel


class Query(BaseModel):
    document_id: str
    session_id: str | None = None
    content: str
