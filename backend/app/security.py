"""Per-user authentication: password hashing + JWTs.

This is entirely separate from `app/auth.py` (the single-password admin
auth) and must not interfere with it in any way.
"""

from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, Header, HTTPException
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession

from .auth import ADMIN_TOKEN
from .config import settings
from .database import get_db
from .models import Usuario

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return _pwd_context.verify(password, password_hash)


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)


def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
    sub = payload.get("sub")
    return sub if isinstance(sub, str) else None


async def get_current_user(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> Usuario:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Não autorizado")

    token = authorization[len("Bearer "):]
    user_id = decode_access_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Não autorizado")

    user = await db.get(Usuario, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Não autorizado")

    return user


async def get_current_approved_user(
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    """Gates member-facing actions behind admin approval.

    Kept separate from `get_current_user` so `GET /api/auth/me` can stay on
    the plain dependency - the frontend needs to load a pending member's
    profile (to show the "aguardando aprovação" screen) even though that
    same member is blocked from every other member action.
    """
    if not current_user.is_admin and current_user.status != "aprovado":
        raise HTTPException(
            status_code=403,
            detail={"error": "Sua conta ainda não foi aprovada pelo administrador."},
        )
    return current_user


async def require_admin_or_master(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Gates admin-only routes. Accepts either the classic shared admin
    token (see app/auth.py) or a regular member JWT belonging to a user
    with `is_admin=True` ("master admin") - her own login then grants admin
    actions directly, with no separate password."""
    if authorization == f"Bearer {ADMIN_TOKEN}":
        return

    user = await get_current_user(authorization=authorization, db=db)
    if not user.is_admin:
        raise HTTPException(status_code=401, detail="Não autorizado")
