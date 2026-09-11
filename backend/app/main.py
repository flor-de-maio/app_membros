import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .blob_storage import UPLOADS_DIR
from .config import settings
from .routers import auth_usuario, desafios, ranking, usuarios

app = FastAPI(title="Flor de Maio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _flatten_pydantic_errors(errors: list) -> dict:
    """Roughly mirrors the shape of zod's `.flatten()`: field errors keyed by
    field name, plus a list of form-level errors."""
    field_errors: dict[str, list[str]] = {}
    form_errors: list[str] = []

    for err in errors:
        loc = [part for part in err.get("loc", []) if part != "body"]
        message = err.get("msg", "Invalid value")
        if loc:
            field_name = str(loc[0])
            field_errors.setdefault(field_name, []).append(message)
        else:
            form_errors.append(message)

    return {"formErrors": form_errors, "fieldErrors": field_errors}


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={"error": "Dados inválidos", "details": _flatten_pydantic_errors(exc.errors())},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Reshape FastAPI's default {"detail": ...} into {"error": ...} to match
    the JSON error shape used throughout the frontend."""
    detail = exc.detail
    content = detail if isinstance(detail, dict) else {"error": detail}
    return JSONResponse(status_code=exc.status_code, content=content, headers=exc.headers)


# On Vercel the filesystem is read-only outside of /tmp, so local disk-backed
# uploads (and the /uploads static mount) simply can't work there - skip
# both rather than crashing the whole function at import time. Production
# uploads go straight to Vercel Blob (see app/blob_storage.py); this mount
# only serves the dev-only local-disk fallback.
if not os.environ.get("VERCEL"):
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.include_router(auth_usuario.router)
app.include_router(usuarios.router)
app.include_router(ranking.router)
app.include_router(desafios.router)
