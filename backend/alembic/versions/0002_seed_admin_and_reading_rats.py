"""seed admin and reading rats

Data-only migration: seeds the initial admin member (Lis Loureiro) and the
"Reading Rats" daily check-in challenge, so the app has something usable
immediately after the schema is created.

The bcrypt hash for the admin's temporary password is computed at
migration-run time via `app.security.hash_password` (alembic/env.py already
puts `backend/` on sys.path, so `app.security` is importable here) rather
than being a hardcoded literal - this keeps the actual password out of
version control while still producing a real, verifiable hash.

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-10

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

ADMIN_NOME = "Lis Loureiro"
ADMIN_EMAIL = "lisloureiro.sousa@gmail.com"
# Temporary password for first login - the admin should change it via
# POST /api/auth/senha immediately after logging in.
ADMIN_SENHA_TEMPORARIA = "FlorDeMaio2026!"

DESAFIO_TITULO = "Reading Rats"
DESAFIO_DESCRICAO = "Poste uma foto da sua leitura do dia e ganhe pontos."
DESAFIO_PONTOS_RECOMPENSA = 5


def upgrade() -> None:
    from app.security import hash_password

    senha_hash = hash_password(ADMIN_SENHA_TEMPORARIA)

    connection = op.get_bind()

    connection.execute(
        sa.text(
            """
            INSERT INTO usuarios (nome, email, senha_hash, is_admin, status, pontos)
            VALUES (:nome, :email, :senha_hash, true, 'aprovado', 0)
            ON CONFLICT (email) DO NOTHING
            """
        ),
        {"nome": ADMIN_NOME, "email": ADMIN_EMAIL, "senha_hash": senha_hash},
    )

    connection.execute(
        sa.text(
            """
            INSERT INTO desafios (titulo, descricao, pontos_recompensa, duracao_dias, ativo)
            VALUES (:titulo, :descricao, :pontos_recompensa, NULL, true)
            """
        ),
        {
            "titulo": DESAFIO_TITULO,
            "descricao": DESAFIO_DESCRICAO,
            "pontos_recompensa": DESAFIO_PONTOS_RECOMPENSA,
        },
    )


def downgrade() -> None:
    connection = op.get_bind()
    connection.execute(
        sa.text("DELETE FROM desafios WHERE titulo = :titulo"), {"titulo": DESAFIO_TITULO}
    )
    connection.execute(
        sa.text("DELETE FROM usuarios WHERE email = :email"), {"email": ADMIN_EMAIL}
    )
