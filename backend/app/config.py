from dataclasses import dataclass
import os


def _parse_origins(value: str) -> tuple[str, ...]:
    return tuple(origin.strip() for origin in value.split(",") if origin.strip())


def normalize_database_url(database_url: str) -> str:
    if database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql+psycopg://", 1)
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return database_url


@dataclass(frozen=True)
class Settings:
    app_name: str
    app_env: str
    api_version: str
    cors_origins: tuple[str, ...]
    database_url: str
    secret_key: str
    access_token_expire_minutes: int


def get_settings() -> Settings:
    database_url = os.getenv(
        "DATABASE_URL", "sqlite:///./coaching_management.db"
    )
    database_url = normalize_database_url(database_url)
    return Settings(
        app_name=os.getenv("APP_NAME", "Coaching Management System"),
        app_env=os.getenv("APP_ENV", "development"),
        api_version=os.getenv("API_VERSION", "1.0.0"),
        cors_origins=_parse_origins(
            os.getenv("CORS_ORIGINS", "http://localhost:4200")
        ),
        database_url=database_url,
        secret_key=os.getenv(
            "SECRET_KEY", "development-only-change-this-secret"
        ),
        access_token_expire_minutes=int(
            os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
        ),
    )
