import uuid

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    nome: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[str] = mapped_column(Text, nullable=False, unique=True, index=True)
    senha_hash: Mapped[str] = mapped_column(Text, nullable=False)
    pontos: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"), index=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    foto_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    # 'pendente' | 'aprovado'. Fresh registrations start as 'pendente' and
    # need admin approval (see app/routers/usuarios.py) before every
    # member-facing action becomes available (get_current_approved_user).
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("'pendente'"))
    created_at: Mapped[object] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )


class Post(Base):
    """Backs desafio_checkins for now (phase 1). The generic community feed
    (/feed, spoiler/categoria columns) is a later phase - not built yet."""

    __tablename__ = "posts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True
    )
    conteudo: Mapped[str] = mapped_column(Text, nullable=False)
    imagem_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[object] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )


class Desafio(Base):
    """Every row is implicitly a daily check-in ("Reading Rats"-style)
    challenge in phase 1 - no tipo/modo_conclusao/acao_tipo columns (1v1 and
    grupo challenges are a later phase, not built yet)."""

    __tablename__ = "desafios"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    titulo: Mapped[str] = mapped_column(Text, nullable=False)
    descricao: Mapped[str | None] = mapped_column(Text, nullable=True)
    pontos_recompensa: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default=text("0")
    )
    # Null means open-ended - never auto-closes by _close_expired_diarios.
    duracao_dias: Mapped[int | None] = mapped_column(Integer, nullable=True)
    # Extra points paid to the top 3 by check-in count once the challenge's
    # duracao_dias window closes, on top of the per-check-in
    # pontos_recompensa credited throughout.
    pontos_bonus_top3: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ativo: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    created_at: Mapped[object] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )


class DesafioCheckin(Base):
    __tablename__ = "desafio_checkins"
    __table_args__ = (
        UniqueConstraint(
            "desafio_id", "usuario_id", "data", name="uq_desafio_checkins_desafio_usuario_data"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    desafio_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("desafios.id", ondelete="CASCADE"), nullable=False, index=True
    )
    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False
    )
    post_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("posts.id", ondelete="SET NULL"), nullable=True
    )
    data: Mapped[object] = mapped_column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    created_at: Mapped[object] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )
