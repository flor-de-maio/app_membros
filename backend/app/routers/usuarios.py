import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Usuario
from ..security import require_admin_or_master
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


@router.get("/api/usuarios", dependencies=[Depends(require_admin_or_master)])
async def list_usuarios(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Usuario).order_by(Usuario.created_at.desc()))
        rows = result.scalars().all()
        return [_serialize(row) for row in rows]
    except Exception:
        logger.exception("Error fetching usuarios")
        return internal_error_response()


@router.post("/api/usuarios/{usuario_id}/aprovar", dependencies=[Depends(require_admin_or_master)])
async def aprovar_usuario(usuario_id: str, db: AsyncSession = Depends(get_db)):
    try:
        row = await db.get(Usuario, usuario_id)
        if row is None:
            raise HTTPException(status_code=404, detail={"error": "Membro não encontrado"})
        row.status = "aprovado"
        await db.commit()
        await db.refresh(row)
        return _serialize(row)
    except HTTPException:
        await db.rollback()
        raise
    except Exception:
        await db.rollback()
        logger.exception("Error approving usuario")
        return internal_error_response()


@router.delete("/api/usuarios/{usuario_id}", dependencies=[Depends(require_admin_or_master)])
async def remover_usuario(usuario_id: str, db: AsyncSession = Depends(get_db)):
    try:
        row = await db.get(Usuario, usuario_id)
        if row is not None:
            await db.delete(row)
            await db.commit()
        return {"success": True}
    except Exception:
        await db.rollback()
        logger.exception("Error removing usuario")
        return internal_error_response()
