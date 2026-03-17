from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Smart Analytics & Task Management Platform"
    database_url: str = "sqlite:///./app.db"
    jwt_secret: str = "CHANGE_ME_TO_A_SECURE_RANDOM_STRING"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    class Config:
        env_file = ".env"


settings = Settings()
