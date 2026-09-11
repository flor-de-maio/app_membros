"""Admin authentication.

The original Express implementation generated one random in-memory token per
process start. That only works on a single long-lived server: on Vercel,
every cold start (and each concurrent instance) is its own process, so a
random per-process token would validate on whichever instance happened to
mint it and reject everywhere else, making the whole password-based admin
flow randomly fail with 401s. Deriving the token from `ADMIN_PASSWORD`
instead keeps it identical across every instance while still never
transmitting the password itself after login.

Not used by the frontend in phase 1 (only member auth in app/security.py is
wired up), but kept fully functional for the admin panel that ships later.
"""

import hashlib

from fastapi import Header, HTTPException

from .config import settings

ADMIN_TOKEN: str = hashlib.sha256(f"admin-token::{settings.ADMIN_PASSWORD}".encode()).hexdigest()


async def require_admin(authorization: str | None = Header(default=None)) -> None:
    if authorization != f"Bearer {ADMIN_TOKEN}":
        raise HTTPException(status_code=401, detail="Não autorizado")
