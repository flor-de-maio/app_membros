"""Biblioteca: the club's "livro do mês" shelf.

An admin adds each book with a cover image (uploaded through the same
blob_storage helper as check-in photos) and an optional external link.
Approved members rate the books 1-5 stars; the first rating on a book also
credits points towards the ranking.
"""

import logging

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..blob_storage import upload_image
from ..database import get_db
from ..models import Livro, LivroAvaliacao, Usuario
from ..schemas import LivroAvaliacaoCreate
from ..security import get_current_approved_user, require_admin_or_master
from .common import internal_error_response

logger = logging.getLogger(__name__)
router = APIRouter()

# Credited once per (livro, usuário) - changing an existing rating doesn't pay
# again, so this can't be farmed by re-rating the same book.
PONTOS_POR_AVALIACAO = 2

MAX_TITULO = 200
MAX_AUTOR = 120
MAX_MES = 60


def _serialize(row: Livro, agregado: dict) -> dict:
    return {
        "id": str(row.id),
        "titulo": row.titulo,
        "autor": row.autor,
        "mes_referencia": row.mes_referencia,
        "capa_url": row.capa_url,
        "link": row.link,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "media_estrelas": agregado["media_estrelas"],
        "total_avaliacoes": agregado["total_avaliacoes"],
        "minha_avaliacao": agregado["minha_avaliacao"],
    }


async def _agregados(db: AsyncSession, livro_ids: list, usuario_id) -> dict:
    """Batches the rating aggregates for `livro_ids` into two queries (instead
    of one per book): the club average/count, and the calling member's own
    ratings. Books with no ratings simply fall back to the empty aggregate."""
    vazio = {"media_estrelas": None, "total_avaliacoes": 0, "minha_avaliacao": None}
    agregados: dict = {livro_id: dict(vazio) for livro_id in livro_ids}
    if not livro_ids:
        return agregados

    media_result = await db.execute(
        select(
            LivroAvaliacao.livro_id,
            func.avg(LivroAvaliacao.estrelas),
            func.count(LivroAvaliacao.id),
        )
        .where(LivroAvaliacao.livro_id.in_(livro_ids))
        .group_by(LivroAvaliacao.livro_id)
    )
    for livro_id, media, total in media_result.all():
        agregados[livro_id]["media_estrelas"] = round(float(media), 1)
        agregados[livro_id]["total_avaliacoes"] = total

    minha_result = await db.execute(
        select(LivroAvaliacao.livro_id, LivroAvaliacao.estrelas).where(
            LivroAvaliacao.livro_id.in_(livro_ids),
            LivroAvaliacao.usuario_id == usuario_id,
        )
    )
    for livro_id, estrelas in minha_result.all():
        agregados[livro_id]["minha_avaliacao"] = estrelas

    return agregados


def _validar_campos(
    titulo: str, mes_referencia: str, autor: str | None, link: str | None
) -> tuple[str, str, str | None, str | None]:
    """Shared boundary validation for create/update: trims, enforces lengths,
    and only accepts real web URLs (the link is rendered as an anchor href, so
    javascript:/data: payloads must be rejected)."""
    titulo = titulo.strip()
    mes_referencia = mes_referencia.strip()
    autor = autor.strip() if autor and autor.strip() else None
    link = link.strip() if link and link.strip() else None

    if not titulo or len(titulo) > MAX_TITULO:
        raise HTTPException(status_code=400, detail={"error": "Título inválido"})
    if not mes_referencia or len(mes_referencia) > MAX_MES:
        raise HTTPException(status_code=400, detail={"error": "Mês inválido"})
    if autor and len(autor) > MAX_AUTOR:
        raise HTTPException(status_code=400, detail={"error": "Autor muito longo"})
    if link and not (link.startswith("http://") or link.startswith("https://")):
        raise HTTPException(
            status_code=400, detail={"error": "Link deve começar com http:// ou https://"}
        )

    return titulo, mes_referencia, autor, link


async def _serialize_muitos(db: AsyncSession, livros: list[Livro], usuario_id) -> list[dict]:
    agregados = await _agregados(db, [livro.id for livro in livros], usuario_id)
    return [_serialize(livro, agregados[livro.id]) for livro in livros]


@router.get("/api/livros")
async def list_livros(
    current_user: Usuario = Depends(get_current_approved_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        # Chronological, not newest-first: the shelf reads as the club's
        # monthly timeline (Fevereiro -> Dezembro), and seeded books carry a
        # created_at pinned to their month.
        result = await db.execute(select(Livro).order_by(Livro.created_at.asc(), Livro.titulo))
        livros = result.scalars().all()
        return await _serialize_muitos(db, livros, current_user.id)
    except Exception:
        logger.exception("Error fetching livros")
        return internal_error_response()


@router.post("/api/livros", status_code=201, dependencies=[Depends(require_admin_or_master)])
async def criar_livro(
    titulo: str = Form(...),
    mes_referencia: str = Form(...),
    autor: str | None = Form(None),
    link: str | None = Form(None),
    capa: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
):
    try:
        titulo, mes_referencia, autor, link = _validar_campos(titulo, mes_referencia, autor, link)

        capa_url = None
        if capa is not None and capa.filename:
            content = await capa.read()
            capa_url = await upload_image(
                content, capa.filename, capa.content_type or "application/octet-stream", folder="livros"
            )

        livro = Livro(
            titulo=titulo,
            autor=autor,
            mes_referencia=mes_referencia,
            capa_url=capa_url,
            link=link,
        )
        db.add(livro)
        await db.commit()
        await db.refresh(livro)

        return _serialize(
            livro,
            {"media_estrelas": None, "total_avaliacoes": 0, "minha_avaliacao": None},
        )
    except HTTPException:
        await db.rollback()
        raise
    except Exception:
        await db.rollback()
        logger.exception("Error creating livro")
        return internal_error_response()


@router.put("/api/livros/{livro_id}", dependencies=[Depends(require_admin_or_master)])
async def atualizar_livro(
    livro_id: str,
    titulo: str = Form(...),
    mes_referencia: str = Form(...),
    autor: str | None = Form(None),
    link: str | None = Form(None),
    capa: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
):
    """Edits a book's fields. The cover is only replaced when a new file is
    sent - leaving it empty keeps the existing image."""
    try:
        livro = await db.get(Livro, livro_id)
        if livro is None:
            raise HTTPException(status_code=404, detail={"error": "Livro não encontrado"})

        titulo, mes_referencia, autor, link = _validar_campos(titulo, mes_referencia, autor, link)

        livro.titulo = titulo
        livro.autor = autor
        livro.mes_referencia = mes_referencia
        livro.link = link

        if capa is not None and capa.filename:
            content = await capa.read()
            livro.capa_url = await upload_image(
                content, capa.filename, capa.content_type or "application/octet-stream", folder="livros"
            )

        await db.commit()
        await db.refresh(livro)

        agregados = await _agregados(db, [livro.id], None)
        return _serialize(livro, agregados[livro.id])
    except HTTPException:
        await db.rollback()
        raise
    except Exception:
        await db.rollback()
        logger.exception("Error updating livro")
        return internal_error_response()


@router.delete("/api/livros/{livro_id}", dependencies=[Depends(require_admin_or_master)])
async def remover_livro(livro_id: str, db: AsyncSession = Depends(get_db)):
    try:
        livro = await db.get(Livro, livro_id)
        if livro is not None:
            # ondelete="CASCADE" on livro_avaliacoes.livro_id clears the ratings.
            await db.delete(livro)
            await db.commit()
        return {"success": True}
    except Exception:
        await db.rollback()
        logger.exception("Error removing livro")
        return internal_error_response()


@router.put("/api/livros/{livro_id}/avaliacao")
async def avaliar_livro(
    livro_id: str,
    payload: LivroAvaliacaoCreate,
    current_user: Usuario = Depends(get_current_approved_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        livro = await db.get(Livro, livro_id)
        if livro is None:
            raise HTTPException(status_code=404, detail={"error": "Livro não encontrado"})

        existing = (
            await db.execute(
                select(LivroAvaliacao).where(
                    LivroAvaliacao.livro_id == livro.id,
                    LivroAvaliacao.usuario_id == current_user.id,
                )
            )
        ).scalar_one_or_none()

        if existing is None:
            db.add(
                LivroAvaliacao(
                    livro_id=livro.id,
                    usuario_id=current_user.id,
                    estrelas=payload.estrelas,
                )
            )
            if PONTOS_POR_AVALIACAO:
                await db.execute(
                    update(Usuario)
                    .where(Usuario.id == current_user.id)
                    .values(pontos=Usuario.pontos + PONTOS_POR_AVALIACAO)
                )
        else:
            # Re-rating only updates the score - the points were already paid.
            existing.estrelas = payload.estrelas

        try:
            await db.commit()
        except IntegrityError:
            # Two first-time ratings for the same book racing each other: the
            # unique constraint (livro_id, usuario_id) rejects the second one.
            await db.rollback()
            raise HTTPException(
                status_code=400, detail={"error": "Não foi possível salvar sua avaliação. Tente novamente."}
            )

        agregados = await _agregados(db, [livro.id], current_user.id)
        return _serialize(livro, agregados[livro.id])
    except HTTPException:
        await db.rollback()
        raise
    except Exception:
        await db.rollback()
        logger.exception("Error rating livro")
        return internal_error_response()
