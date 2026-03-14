from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Parivesh"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "supers3cr3tk3y-changethis-in-production!"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Database – Supabase Postgres
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/parivesh"
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 0
    DB_POOL_TIMEOUT: int = 60
    DB_POOL_RECYCLE: int = 1800

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    CORS_ALLOW_CREDENTIALS: bool = True

    # Supabase (optional for now, but in .env)
    SUPABASE_URL: str | None = None
    SUPABASE_ANON_KEY: str | None = None
    SUPABASE_JWT_SECRET: str | None = None
    SUPABASE_EXPECTED_AUDIENCE: str = "authenticated"
    SUPABASE_JWKS_CACHE_TTL_SECONDS: int = 3600
    SUPABASE_USER_CACHE_TTL_SECONDS: int = 300
    AUTH_USER_CACHE_TTL_SECONDS: int = 120

    # Request latency metrics
    LATENCY_METRICS_ENABLED: bool = True
    LATENCY_METRICS_WINDOW_SIZE: int = 200
    LATENCY_METRICS_LOG_EVERY: int = 50

    # Google (used by agent / AI features)
    GOOGLE_API_KEY: str | None = None
    GOOGLE_CLIENT_ID: str | None = None

    # NaaS (Notification as a Service) webhook integration
    NAAS_ENABLED: bool = False
    NAAS_PROVIDER: str = "WEBHOOK"
    NAAS_WEBHOOK_URLS: str = ""
    NAAS_AUTH_TOKEN: str | None = None
    NAAS_TIMEOUT_SECONDS: int = 5

    class Config:
        case_sensitive = True
        extra = "ignore"
        env_file = str(Path(__file__).resolve().parent.parent.parent / ".env")
        env_file_encoding = "utf-8"


settings = Settings()


def get_cors_origins() -> list[str]:
    return [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
