"""seed the 2026 reading list

Data-only migration: seeds the club's 2026 reading list - one book per month,
February through December - so the library starts populated instead of empty.

Covers and links are intentionally left empty; an admin fills them in later
through the edit action. `created_at` is pinned to the 1st of each book's
month (instead of now()) so the library's chronological ordering is stable
and meaningful rather than dependent on insert order.

Revision ID: 0004
Revises: 0003
Create Date: 2026-09-28

"""
from datetime import datetime, timezone
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# (titulo, autor, mes_referencia, mês)
LIVROS = [
    ("Jantar Secreto", "Raphael Montes", "Fevereiro 2026", 2),
    ("A sombra do vento", "Carlos Ruiz Zafón", "Março 2026", 3),
    ("A dona da casa perfeita", "Liane Child", "Abril 2026", 4),
    ("É sempre a hora da morte amém", "Mariana Salomão Carrara", "Maio 2026", 5),
    ("Pactos mortais", "Steve Caravanah", "Junho 2026", 6),
    ("Nunca Minta", "Freida McFadden", "Julho 2026", 7),
    ("Minha adorável esposa", "Samantha Downing", "Agosto 2026", 8),
    ("Mulherzinhas", "Luisa May Allcot", "Setembro 2026", 9),
    ("O Iluminado", "Stephen King", "Outubro 2026", 10),
    ("Ainda não morri", "Holly Jackson", "Novembro 2026", 11),
    ("Uma família feliz", "Raphael Montes", "Dezembro 2026", 12),
]

livros_table = sa.table(
    "livros",
    sa.column("titulo", sa.Text),
    sa.column("autor", sa.Text),
    sa.column("mes_referencia", sa.Text),
    sa.column("created_at", sa.DateTime(timezone=True)),
)


def upgrade() -> None:
    op.bulk_insert(
        livros_table,
        [
            {
                "titulo": titulo,
                "autor": autor,
                "mes_referencia": mes_referencia,
                "created_at": datetime(2026, mes, 1, 12, 0, tzinfo=timezone.utc),
            }
            for titulo, autor, mes_referencia, mes in LIVROS
        ],
    )


def downgrade() -> None:
    op.execute(
        livros_table.delete().where(
            livros_table.c.mes_referencia.in_([mes for _, _, mes, _ in LIVROS])
        )
    )
