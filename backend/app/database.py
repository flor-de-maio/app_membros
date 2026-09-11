import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from .config import settings

# On Vercel each invocation may land on a fresh container, so a persistent
# connection pool doesn't help (and can leak connections across cold starts).
# NullPool opens a fresh connection per checkout instead. The Docker/uvicorn
# path keeps SQLAlchemy's normal pooling, which is what you want for a
# long-lived process.
_engine_kwargs = {"pool_pre_ping": True, "connect_args": settings.engine_connect_args}
if os.environ.get("VERCEL"):
    _engine_kwargs = {"poolclass": NullPool, "connect_args": settings.engine_connect_args}

engine = create_async_engine(settings.async_database_url, **_engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
