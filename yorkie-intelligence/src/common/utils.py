from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Yorkie Intellignce"
    go_url: str = ""
    ollama_url: str = "localhost:11343"
    model_type: str
    model_name: str
    api_key: str

    # src/.env ?
    model_config = SettingsConfigDict(env_file="src/.env")


# TODO
# https://fastapi.tiangolo.com/advanced/settings/#the-env-file
# what is diffrence between basic define and using lru_cache

SETTINGS = Settings()
