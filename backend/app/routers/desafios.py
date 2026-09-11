"""Reading Rats: the phase-1 daily check-in challenge.

Every `Desafio` row in phase 1 is implicitly a daily check-in challenge (no
`tipo`/`modo_conclusao` columns - those distinguish 1v1/grupo challenges,
which are a later phase and have no backend code yet).
"""

import logging
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..blob_storage import upload_image
from ..database import get_db
from ..models import Desafio, DesafioCheckin, Post, Usuario
from ..security import get_current_approved_user
from .common import internal_error_response

logger = logging.getLogger(__name__)
router = APIRouter()

# Check-ins use the club's local calendar day, not the server's (UTC on
# Vercel) - otherwise a check-in near midnight BRT lands on the "wrong" day
# from the user's perspective and can look like two check-ins in one day.
BRASIL_TZ = ZoneInfo("America/Bahia")


def _serialize_desafio(row: Desafio) -> dict:
    return {
        "id": str(row.id),
        "titulo": row.titulo,
        "descricao": row.descricao,
        "pontos_recompensa": row.pontos_recompensa,
        "duracao_dias": row.duracao_dias,
        "pontos_bonus_top3": row.pontos_bonus_top3,
        "ativo": row.ativo,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


async def _close_expired_diarios(db: AsyncSession) -> None:
    """Auto-deactivates "Reading Rats" desafios whose admin-defined
    `duracao_dias` window has elapsed since creation. Per-check-in points
    (`pontos_recompensa`) were already credited throughout via the checkin
    endpoint below; here we additionally pay `pontos_bonus_top3` (if set) to
    the 3 members with the most check-ins, as a one-time bonus on top of
    that (same amount to each of the top 3 - kept simple).

    Each desafio is claimed with an atomic conditional UPDATE
    (`WHERE ativo = true`) before any bonus is computed or paid - this
    prevents the bonus from being credited twice if two requests race to
    close the same desafio.
    """
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Desafio).where(
            Desafio.ativo == True,  # noqa: E712
            Desafio.duracao_dias.is_not(None),
        )
    )
    candidatos = result.scalars().all()
    expired = [d for d in candidatos if d.created_at + timedelta(days=d.duracao_dias) <= now]
    if not expired:
        return

    for desafio in expired:
        claim = await db.execute(
            update(Desafio)
            .where(Desafio.id == desafio.id, Desafio.ativo == True)  # noqa: E712
            .values(ativo=False)
        )
        if claim.rowcount == 0:
            # Another concurrent call already closed this desafio.
            continue

        if desafio.pontos_bonus_top3:
            rank_result = await db.execute(
                select(DesafioCheckin.usuario_id, func.count(DesafioCheckin.id).label("total"))
                .where(DesafioCheckin.desafio_id == desafio.id)
                .group_by(DesafioCheckin.usuario_id)
                .order_by(func.count(DesafioCheckin.id).desc())
                .limit(3)
            )
            top3_ids = [usuario_id for usuario_id, _ in rank_result.all()]
            for usuario_id in top3_ids:
                await db.execute(
                    update(Usuario)
                    .where(Usuario.id == usuario_id)
                    .values(pontos=Usuario.pontos + desafio.pontos_bonus_top3)
                )

    await db.commit()


@router.get("/api/desafios")
async def list_desafios(
    current_user: Usuario = Depends(get_current_approved_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        await _close_expired_diarios(db)

        result = await db.execute(
            select(Desafio).where(Desafio.ativo == True).order_by(Desafio.created_at)  # noqa: E712
        )
        desafios = result.scalars().all()
        desafio_ids = [d.id for d in desafios]

        # Batch-load check-in rankings for every desafio in one query
        # (instead of one query per desafio).
        ranking_by_desafio: dict = {}
        if desafio_ids:
            rank_result = await db.execute(
                select(
                    DesafioCheckin.desafio_id,
                    Usuario.id,
                    Usuario.nome,
                    Usuario.foto_url,
                    func.count(DesafioCheckin.id).label("total"),
                )
                .join(Usuario, Usuario.id == DesafioCheckin.usuario_id)
                .where(DesafioCheckin.desafio_id.in_(desafio_ids))
                .group_by(DesafioCheckin.desafio_id, Usuario.id, Usuario.nome, Usuario.foto_url)
                .order_by(DesafioCheckin.desafio_id, func.count(DesafioCheckin.id).desc())
            )
            for desafio_id, uid, nome, foto_url, count in rank_result.all():
                bucket = ranking_by_desafio.setdefault(desafio_id, [])
                if len(bucket) < 10:
                    bucket.append(
                        {"usuario_id": str(uid), "nome": nome, "foto_url": foto_url, "count": count}
                    )

        # Batch-load the ~12 most recent check-in photos for every desafio
        # (instead of one query per desafio).
        fotos_by_desafio: dict = {}
        if desafio_ids:
            fotos_result = await db.execute(
                select(
                    DesafioCheckin.desafio_id,
                    DesafioCheckin.created_at,
                    Post.imagem_url,
                    Usuario.nome,
                )
                .join(Post, Post.id == DesafioCheckin.post_id)
                .join(Usuario, Usuario.id == DesafioCheckin.usuario_id)
                .where(DesafioCheckin.desafio_id.in_(desafio_ids), Post.imagem_url.is_not(None))
                .order_by(DesafioCheckin.desafio_id, DesafioCheckin.created_at.desc())
            )
            for desafio_id, created_at, imagem_url, nome in fotos_result.all():
                bucket = fotos_by_desafio.setdefault(desafio_id, [])
                if len(bucket) < 12:
                    bucket.append(
                        {
                            "nome": nome,
                            "imagem_url": imagem_url,
                            "created_at": created_at.isoformat() if created_at else None,
                        }
                    )

        # Which desafios the current member already checked into today - so
        # the frontend can hide/disable the composer instead of letting them
        # post again with no visible sign it won't earn points.
        checkins_hoje: set = set()
        if desafio_ids:
            hoje = datetime.now(BRASIL_TZ).date()
            hoje_result = await db.execute(
                select(DesafioCheckin.desafio_id).where(
                    DesafioCheckin.desafio_id.in_(desafio_ids),
                    DesafioCheckin.usuario_id == current_user.id,
                    DesafioCheckin.data == hoje,
                )
            )
            checkins_hoje = {row[0] for row in hoje_result.all()}

        response = []
        for desafio in desafios:
            item = _serialize_desafio(desafio)
            item["ranking"] = ranking_by_desafio.get(desafio.id, [])
            item["fotos"] = fotos_by_desafio.get(desafio.id, [])
            item["ja_fez_checkin_hoje"] = desafio.id in checkins_hoje
            response.append(item)

        return response
    except Exception:
        logger.exception("Error fetching desafios")
        return internal_error_response()


@router.post("/api/desafios/{desafio_id}/checkin", status_code=201)
async def checkin(
    desafio_id: str,
    conteudo: str = Form(...),
    imagem: UploadFile = File(...),
    current_user: Usuario = Depends(get_current_approved_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        conteudo = conteudo.strip()
        if not conteudo or len(conteudo) > 2000:
            raise HTTPException(status_code=400, detail={"error": "Conteúdo inválido"})

        desafio = await db.get(Desafio, desafio_id)
        desafio_expirado = (
            desafio is not None
            and desafio.duracao_dias is not None
            and desafio.created_at + timedelta(days=desafio.duracao_dias) <= datetime.now(timezone.utc)
        )
        if desafio is None or not desafio.ativo or desafio_expirado:
            raise HTTPException(
                status_code=400, detail={"error": "Desafio não encontrado ou inativo"}
            )

        if not imagem.filename:
            raise HTTPException(
                status_code=400, detail={"error": "Envie uma foto para fazer o check-in"}
            )

        content = await imagem.read()
        imagem_url = await upload_image(
            content, imagem.filename, imagem.content_type or "application/octet-stream"
        )

        post = Post(usuario_id=current_user.id, conteudo=conteudo, imagem_url=imagem_url)
        db.add(post)
        await db.flush()

        today = datetime.now(BRASIL_TZ).date()
        db.add(
            DesafioCheckin(
                desafio_id=desafio.id,
                usuario_id=current_user.id,
                post_id=post.id,
                data=today,
            )
        )

        if desafio.pontos_recompensa:
            await db.execute(
                update(Usuario)
                .where(Usuario.id == current_user.id)
                .values(pontos=Usuario.pontos + desafio.pontos_recompensa)
            )

        try:
            await db.commit()
        except IntegrityError:
            # Relies on the DB-level unique constraint (desafio_id,
            # usuario_id, data) rather than a racy SELECT-then-INSERT to
            # enforce "one check-in per person per day".
            await db.rollback()
            raise HTTPException(
                status_code=400, detail={"error": "Você já fez check-in hoje neste desafio"}
            )

        await db.refresh(post)
        return {
            "id": str(post.id),
            "conteudo": post.conteudo,
            "imagem_url": post.imagem_url,
            "created_at": post.created_at.isoformat() if post.created_at else None,
            "desafio_id": str(desafio.id),
            "pontos_ganhos": desafio.pontos_recompensa,
        }
    except HTTPException:
        await db.rollback()
        raise
    except Exception:
        await db.rollback()
        logger.exception("Error creating desafio checkin")
        return internal_error_response()
