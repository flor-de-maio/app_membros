"""initial phase-1 schema

Creates the lean phase-1 tables: usuarios, posts, desafios,
desafio_checkins. Only auth, ranking, and the "Reading Rats" daily
check-in challenge are functional in phase 1 - every other feature area
(biblioteca, livros, feed, avisos, push, 1v1/grupo desafios, etc.) is a
later phase and has no backend code (or tables) yet.

Revision ID: 0001
Revises:
Create Date: 2026-09-10

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # gen_random_uuid() lives in pgcrypto on PG < 14; harmless/no-op on PG14+
    # where it is built in.
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")

    op.create_table(
        "usuarios",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("nome", sa.Text(), nullable=False),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("senha_hash", sa.Text(), nullable=False),
        sa.Column("pontos", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("foto_url", sa.Text(), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default=sa.text("'pendente'")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.UniqueConstraint("email", name="uq_usuarios_email"),
    )
    op.create_index("ix_usuarios_email", "usuarios", ["email"])
    op.create_index("ix_usuarios_pontos", "usuarios", ["pontos"])

    op.create_table(
        "posts",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "usuario_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("usuarios.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("conteudo", sa.Text(), nullable=False),
        sa.Column("imagem_url", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_posts_usuario_id", "posts", ["usuario_id"])

    op.create_table(
        "desafios",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("titulo", sa.Text(), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=True),
        sa.Column(
            "pontos_recompensa", sa.Integer(), nullable=False, server_default=sa.text("0")
        ),
        # Null means open-ended - never auto-closes.
        sa.Column("duracao_dias", sa.Integer(), nullable=True),
        sa.Column("pontos_bonus_top3", sa.Integer(), nullable=True),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    op.create_table(
        "desafio_checkins",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "desafio_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("desafios.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "usuario_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("usuarios.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "post_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("posts.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("data", sa.Date(), nullable=False, server_default=sa.text("CURRENT_DATE")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        # Enforces "one check-in per person per day" at the DB level - the
        # checkin endpoint relies on catching the resulting IntegrityError
        # rather than a racy SELECT-then-INSERT.
        sa.UniqueConstraint(
            "desafio_id", "usuario_id", "data", name="uq_desafio_checkins_desafio_usuario_data"
        ),
    )
    op.create_index("ix_desafio_checkins_desafio_id", "desafio_checkins", ["desafio_id"])


def downgrade() -> None:
    op.drop_table("desafio_checkins")
    op.drop_table("desafios")
    op.drop_table("posts")
    op.drop_table("usuarios")
