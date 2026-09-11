import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Usuario
from ..security import get_current_approved_user, require_admin_or_master
from .common import internal_error_response

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/api/ranking")
async def get_ranking(
    current_user: Usuario = Depends(get_current_approved_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        # Only approved members show up on the leaderboard/podium - pending
        # registrations have no points yet and shouldn't clutter it.
        result = await db.execute(
            select(Usuario)
            .where(Usuario.status == "aprovado")
            .order_by(Usuario.pontos.desc(), Usuario.created_at.asc())
        )
        rows = result.scalars().all()

        ranking = [
            {
                "usuario_id": str(row.id),
                "nome": row.nome,
                "pontos": row.pontos,
                "foto_url": row.foto_url,
                "bio": row.bio,
            }
            for row in rows
        ]

        minha_posicao = None
        for idx, row in enumerate(rows, start=1):
            if row.id == current_user.id:
                minha_posicao = idx
                break

        return {"ranking": ranking, "minha_posicao": minha_posicao}
    except Exception:
        logger.exception("Error fetching ranking")
        return internal_error_response()


@router.post("/api/ranking/zerar", dependencies=[Depends(require_admin_or_master)])
async def zerar_ranking(db: AsyncSession = Depends(get_db)):
    """Resets every member's points back to zero - used to start a new
    season/cycle of the ranking without deleting the members themselves."""
    try:
        await db.execute(update(Usuario).values(pontos=0))
        await db.commit()
        return {"success": True}
    except Exception:
        await db.rollback()
        logger.exception("Error resetting ranking points")
        return internal_error_response()
