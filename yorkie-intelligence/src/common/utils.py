from pydantic_settings import BaseSettings, SettingsConfigDict
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import BaseMessage, AIMessage
from pydantic import BaseModel, Field
from cachetools import TTLCache
import uuid


class Settings(BaseSettings):
    APP_NAME: str = "Yorkie Intellignce"
    GO_BACKEND_URL: str = ""
    OLLAMA_URL: str = "localhost:11434"
    MODEL_TYPE: str
    MODEL_NAME: str
    API_KEY: str | None = None

    model_config = SettingsConfigDict(env_file="src/.env.deployment")


SETTINGS = Settings()


class InMemoryHistory(BaseChatMessageHistory, BaseModel):
    """In memory implementation of chat message history."""

    # TODO
    # apply ttl cache

    messages: list[BaseMessage] = Field(default_factory=list)

    def add_messages(self, messages: list[BaseMessage]) -> None:
        """Add a list of messages to the store"""
        self.messages.extend(messages)

    def clear(self) -> None:
        self.messages = []


# TODO
# chane this to TTLCache
store = TTLCache(maxsize=100, ttl=60)


def get_by_session_id(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = InMemoryHistory()
    return store[session_id]


def generate_session_id() -> str:
    return str(uuid.uuid4())
