"""biblioteca: livros do mês + avaliações

Creates the club's library shelf: `livros` (each "livro do mês", added by an
admin with a cover image and an optional external link) and
`livro_avaliacoes` (the 1-5 star rating an approved member leaves on a book).

Revision ID: 0003
Revises: 0002
Create Date: 2026-09-28

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "livros",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("titulo", sa.Text(), nullable=False),
        sa.Column("autor", sa.Text(), nullable=True),
        # Free text on purpose (e.g. "Fevereiro 2026").
        sa.Column("mes_referencia", sa.Text(), nullable=False),
        sa.Column("capa_url", sa.Text(), nullable=True),
        sa.Column("link", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    op.create_table(
        "livro_avaliacoes",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "livro_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("livros.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "usuario_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("usuarios.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("estrelas", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        # Enforces "one rating per person per book" at the DB level - the
        # avaliacao endpoint relies on catching the resulting IntegrityError
        # rather than a racy SELECT-then-INSERT.
        sa.UniqueConstraint("livro_id", "usuario_id", name="uq_livro_avaliacoes_livro_usuario"),
    )
    op.create_index("ix_livro_avaliacoes_livro_id", "livro_avaliacoes", ["livro_id"])


def downgrade() -> None:
    op.drop_table("livro_avaliacoes")
    op.drop_table("livros")
