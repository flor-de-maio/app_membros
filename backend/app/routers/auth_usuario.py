import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..blob_storage import upload_image
from ..database import get_db
from ..models import Usuario
from ..schemas import UsuarioCreate, UsuarioLogin, UsuarioNomeUpdate, UsuarioSenhaUpdate
from ..security import (
    create_access_token,
    get_current_approved_user,
    get_current_user,
    hash_password,
    verify_password,
)
from .common import internal_error_response

logger = logging.getLogger(__name__)
router = APIRouter()


def _serialize(row: Usuario) -> dict:
    return {
        "id": str(row.id),
        "nome": row.nome,
        "email": row.email,
        "pontos": row.pontos,
        "is_admin": row.is_admin,
        "foto_url": row.foto_url,
        "bio": row.bio,
        "status": row.status,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


@router.post("/api/auth/registro", status_code=201)
async def registro(payload: UsuarioCreate, db: AsyncSession = Depends(get_db)):
    try:
        existing = await db.execute(select(Usuario).where(Usuario.email == payload.email))
        if existing.scalars().first() is not None:
            raise HTTPException(status_code=400, detail={"error": "E-mail já cadastrado"})

        row = Usuario(
            nome=payload.nome,
            email=payload.email,
            senha_hash=hash_password(payload.senha),
            status="pendente",
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)

        # No auto-login - matches the pending-approval flow: registration
        # only creates the account, the member has to log in separately
        # (and will see a "pending approval" screen client-side until an
        # admin approves them).
        return {"success": True, "usuario": _serialize(row)}
    except HTTPException:
        await db.rollback()
        raise
    except Exception:
        await db.rollback()
        logger.exception("Error registering usuario")
        return internal_error_response()


@router.post("/api/auth/login")
async def login(payload: UsuarioLogin, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Usuario).where(Usuario.email == payload.email))
        row = result.scalars().first()

        if row is None or not verify_password(payload.senha, row.senha_hash):
            raise HTTPException(
                status_code=401, detail={"error": "E-mail ou senha incorretos"}
            )

        # Issued regardless of `status` - the frontend gates member actions
        # on `status` via useAuthGuard/PendingApprovalScreen, so a pending
        # member can still log in and see the "aguardando aprovação" screen
        # instead of getting stuck unable to authenticate at all.
        token = create_access_token(str(row.id))
        return {"success": True, "token": token, "usuario": _serialize(row)}
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error logging in usuario")
        return internal_error_response()


@router.get("/api/auth/me")
async def me(current_user: Usuario = Depends(get_current_user)):
    # Plain get_current_user (not get_current_approved_user) so a pending
    # member's profile still loads - the frontend needs it to show the
    # "aguardando aprovação" screen.
    return _serialize(current_user)


@router.patch("/api/auth/me")
async def update_me(
    payload: UsuarioNomeUpdate,
    current_user: Usuario = Depends(get_current_approved_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_row = await db.get(Usuario, current_user.id)
        data = payload.model_dump(exclude_unset=True)
        if "nome" in data and data["nome"] is not None:
            user_row.nome = data["nome"]
        if "bio" in data:
            user_row.bio = data["bio"] or None
        await db.commit()
        await db.refresh(user_row)
        return _serialize(user_row)
    except Exception:
        await db.rollback()
        logger.exception("Error updating usuario perfil")
        return internal_error_response()


@router.post("/api/auth/me/foto")
async def upload_foto_perfil(
    foto: UploadFile = File(...),
    current_user: Usuario = Depends(get_current_approved_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        if not foto.filename:
            raise HTTPException(status_code=400, detail={"error": "Nenhuma imagem enviada"})
        content = await foto.read()
        foto_url = await upload_image(
            content, foto.filename, foto.content_type or "application/octet-stream", folder="avatars"
        )

        user_row = await db.get(Usuario, current_user.id)
        user_row.foto_url = foto_url
        await db.commit()
        await db.refresh(user_row)
        return _serialize(user_row)
    except HTTPException:
        await db.rollback()
        raise
    except Exception:
        await db.rollback()
        logger.exception("Error uploading foto de perfil")
        return internal_error_response()


@router.post("/api/auth/senha")
async def alterar_senha(
    payload: UsuarioSenhaUpdate,
    current_user: Usuario = Depends(get_current_approved_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_row = await db.get(Usuario, current_user.id)
        if not verify_password(payload.senha_atual, user_row.senha_hash):
            raise HTTPException(status_code=400, detail={"error": "Senha atual incorreta"})

        user_row.senha_hash = hash_password(payload.nova_senha)
        await db.commit()
        return {"success": True}
    except HTTPException:
        await db.rollback()
        raise
    except Exception:
        await db.rollback()
        logger.exception("Error updating usuario senha")
        return internal_error_response()
