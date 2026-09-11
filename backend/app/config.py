import os
from functools import lru_cache
from typing import Any, Dict, List
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_INSECURE_DEFAULTS = {
    "ADMIN_PASSWORD": "flordemaio2026",
    "JWT_SECRET": "dev-only-insecure-secret-fd9c2a17-6e5b-change-me",
}


class Settings(BaseSettings):
    """Application settings, populated from environment variables / .env file."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql://username:password@localhost:5432/database_name"
    # PORT is only consumed by the Docker/uvicorn entrypoint (see
    # entrypoint.sh) - it's meaningless on Vercel, which invokes the ASGI app
    # directly rather than binding a port. Vercel's own runtime reserves/sets
    # this env var to an empty string, which would otherwise fail int
    # validation and crash the whole function at import time - so an empty
    # value is treated as "use the default" instead of an error.
    PORT: int = 3001
    ADMIN_PASSWORD: str = "flordemaio2026"
    CORS_ORIGINS: str = "http://localhost:5000"

    # Secret used to sign per-user JWTs (separate from the admin auth above).
    # The default below is only for local development - production MUST
    # override this via the JWT_SECRET environment variable.
    JWT_SECRET: str = "dev-only-insecure-secret-fd9c2a17-6e5b-change-me"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7

    # Required for post/check-in photo uploads (see app/blob_storage.py).
    # Auto-injected by Vercel once a Blob store is connected to the project;
    # left empty for local dev, where blob_storage.py falls back to saving
    # files under backend/public/uploads instead.
    BLOB_READ_WRITE_TOKEN: str = ""

    @field_validator("PORT", mode="before")
    @classmethod
    def _blank_port_uses_default(cls, v):
        return 3001 if v == "" else v

    @field_validator("JWT_EXPIRE_MINUTES", mode="before")
    @classmethod
    def _blank_jwt_expire_uses_default(cls, v):
        return 60 * 24 * 7 if v == "" else v

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def async_database_url(self) -> str:
        """Ensure the URL uses the asyncpg driver for SQLAlchemy's async engine.

        Hosted Postgres providers (e.g. Neon) hand out URLs with libpq-style
        query params like `sslmode=require` and `channel_binding=require` -
        asyncpg doesn't understand either as connection kwargs, so they're
        stripped here. The SSL requirement itself is applied via
        `engine_connect_args` instead (passed as `connect_args` to
        `create_async_engine`).
        """
        url = self.DATABASE_URL
        if url.startswith("postgresql+asyncpg://"):
            pass
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)

        parts = urlsplit(url)
        query = [
            (k, v)
            for k, v in parse_qsl(parts.query)
            if k not in ("sslmode", "channel_binding")
        ]
        return urlunsplit(parts._replace(query=urlencode(query)))

    @property
    def engine_connect_args(self) -> Dict[str, Any]:
        """asyncpg connect kwargs - enables SSL when the original URL asked for it."""
        query = dict(parse_qsl(urlsplit(self.DATABASE_URL).query))
        if query.get("sslmode") in ("require", "verify-ca", "verify-full"):
            return {"ssl": "require"}
        return {}


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    # Fail loudly at startup rather than silently serving production traffic
    # with a secret/password that's sitting in plain sight in this file -
    # only enforced on Vercel so local dev keeps working with no setup.
    if os.environ.get("VERCEL"):
        for field, insecure_value in _INSECURE_DEFAULTS.items():
            if getattr(settings, field) == insecure_value:
                raise RuntimeError(
                    f"{field} is still set to its insecure default value. "
                    f"Set a real {field} environment variable on Vercel before deploying."
                )
    return settings


settings = get_settings()
