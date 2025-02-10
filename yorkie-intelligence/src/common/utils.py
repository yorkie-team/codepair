from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Yorkie Intellignce"
    GO_BACKEND_URL: str = ""
    OLLAMA_URL: str = "localhost:11434"
    MODEL_TYPE: str
    MODEL_NAME: str
    API_KEY: str | None = None

    model_config = SettingsConfigDict(env_file="src/.env.deployment")


SETTINGS = Settings()
