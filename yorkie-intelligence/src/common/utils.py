from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Yorkie Intellignce"
    go_url: str = ""
    ollama_url: str = "localhost:11343"
    model_type: str
    model_name: str
    api_key: str

    model_config = SettingsConfigDict(env_file="src/.env")


SETTINGS = Settings()
