from langchain_core.language_models import BaseChatModel
from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI

from src.common.utils import SETTINGS


def get_model() -> BaseChatModel:
    if SETTINGS.model_type == "ollama":
        llm = ChatOllama(model=SETTINGS.model_name, temperature=0)
    elif SETTINGS.model_type == "openai":
        llm = ChatOpenAI(
            model=SETTINGS.model_name, api_key=SETTINGS.api_key, temperature=0
        )
    else:
        raise ValueError("Invalid model type")

    # TODO
    # support more model type

    return llm
