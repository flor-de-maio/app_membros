"""Uploads files to Vercel Blob storage.

Serverless functions have no persistent local disk, so anything meant to be
readable after the request ends - like a check-in photo - has to live in
real object storage. Vercel Blob exposes a plain HTTP PUT API, so no vendor
SDK is needed here.

Dev-only fallback: when there's no BLOB_READ_WRITE_TOKEN configured and this
isn't running on Vercel, files are saved to local disk instead (mirroring
the reference project's legacy multer-style `app/uploads.py` helper), so a
local Docker/uvicorn dev setup can be smoke-tested without a real Vercel
Blob account. `app/main.py` mounts that same directory at /uploads, guarded
the same way (`if not os.environ.get("VERCEL")`).
"""

import os
import random
import string
import time
from pathlib import Path

import httpx
from fastapi import HTTPException

from .config import settings

_BLOB_API_BASE = "https://blob.vercel-storage.com"
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB

BACKEND_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BACKEND_DIR / "public" / "uploads"


def _random_suffix() -> str:
    alphabet = string.digits + string.ascii_lowercase
    return "".join(random.choice(alphabet) for _ in range(11))


def _save_local(content: bytes, filename: str, folder: str) -> str:
    """Dev-only fallback: saves to backend/public/uploads and returns a
    `/uploads/<filename>` URL, mirroring the reference project's legacy
    disk-based uploads.py multer-style random filename generation."""
    uploads_dir = UPLOADS_DIR
    uploads_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(filename or "").suffix or ".jpg"
    disk_filename = f"{folder}-{int(time.time() * 1000)}-{_random_suffix()}{ext}"
    destination = uploads_dir / disk_filename
    with open(destination, "wb") as out_file:
        out_file.write(content)

    return f"/uploads/{disk_filename}"


async def upload_image(content: bytes, filename: str, content_type: str, folder: str = "posts") -> str:
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail={"error": "Imagem muito grande (máx. 10MB)"})

    if not settings.BLOB_READ_WRITE_TOKEN:
        if os.environ.get("VERCEL"):
            raise HTTPException(
                status_code=500, detail={"error": "Upload de imagem não configurado no servidor"}
            )
        # Local dev without a real Vercel Blob token - fall back to disk.
        return _save_local(content, filename, folder)

    ext = filename.rsplit(".", 1)[-1] if "." in filename else "jpg"
    pathname = f"{folder}/{int(time.time() * 1000)}-{_random_suffix()}.{ext}"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.put(
                f"{_BLOB_API_BASE}/{pathname}",
                content=content,
                headers={
                    "authorization": f"Bearer {settings.BLOB_READ_WRITE_TOKEN}",
                    "x-content-type": content_type or "application/octet-stream",
                    "x-api-version": "7",
                },
            )
        resp.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail={"error": "Falha ao enviar imagem"}) from exc

    return resp.json()["url"]
