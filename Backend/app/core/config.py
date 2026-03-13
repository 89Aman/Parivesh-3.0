from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Parivesh"
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = "supers3cr3tk3y-changethis-in-production!"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Database – Supabase Postgres
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/parivesh"

    # Supabase (optional for now, but in .env)
    SUPABASE_URL: str | None = None
    SUPABASE_ANON_KEY: str | None = None

    class Config:
        case_sensitive = True
        env_file = str(Path(__file__).resolve().parent.parent.parent / ".env")
        env_file_encoding = "utf-8"


settings = Settings()
