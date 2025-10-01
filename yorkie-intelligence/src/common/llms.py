from langchain_core.language_models import BaseChatModel
from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI

from src.common.utils import SETTINGS


def get_model() -> BaseChatModel:
    if SETTINGS.MODEL_TYPE == "ollama":
        llm = ChatOllama(model=SETTINGS.MODEL_NAME, temperature=0)
    elif SETTINGS.MODEL_TYPE == "openai":
        llm = ChatOpenAI(
            model=SETTINGS.MODEL_NAME, api_key=SETTINGS.API_KEY, temperature=0
        )
    else:
        raise ValueError("Invalid model type")

    # TODO
    # support more model type

    return llm
