from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Yorkie Intellignce"
    go_url: str = ""
    model_name: str
    api_key: str

    model_config = SettingsConfigDict(env_file=".env")


# TODO
# https://fastapi.tiangolo.com/advanced/settings/#the-env-file
# lru_cache와 그냥 선언하는 것의 차이
SETTINGS = Settings()
