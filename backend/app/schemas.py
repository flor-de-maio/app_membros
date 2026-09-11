"""Pydantic v2 models for the phase-1 (auth, ranking, "Reading Rats" daily
check-in) feature set. Mirrors the reference project's conventions."""

from typing import Annotated, List, Optional

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    StringConstraints,
    model_validator,
)


class TrimmedModel(BaseModel):
    """Base model that trims all incoming string fields, mirroring zod's .trim()."""

    @model_validator(mode="before")
    @classmethod
    def _strip_strings(cls, data):
        if isinstance(data, dict):
            return {k: (v.strip() if isinstance(v, str) else v) for k, v in data.items()}
        return data


# ─── Usuários (membros) ───
class UsuarioCreate(TrimmedModel):
    nome: Annotated[str, StringConstraints(min_length=2, max_length=100)]
    email: Annotated[EmailStr, Field(max_length=255)]
    senha: Annotated[str, StringConstraints(min_length=6, max_length=100)]


class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str


class UsuarioNomeUpdate(TrimmedModel):
    nome: Optional[Annotated[str, StringConstraints(min_length=2, max_length=100)]] = None
    bio: Optional[Annotated[str, StringConstraints(max_length=160)]] = None


class UsuarioSenhaUpdate(TrimmedModel):
    senha_atual: Annotated[str, StringConstraints(min_length=1)]
    nova_senha: Annotated[str, StringConstraints(min_length=6, max_length=100)]


class UsuarioRead(BaseModel):
    id: str
    nome: str
    email: str
    pontos: int
    is_admin: bool
    foto_url: Optional[str] = None
    bio: Optional[str] = None
    status: str = "pendente"
    created_at: object

    model_config = {"from_attributes": True}


# ─── Ranking ───
class RankingEntradaRead(BaseModel):
    usuario_id: str
    nome: str
    pontos: int
    foto_url: Optional[str] = None
    bio: Optional[str] = None


class RankingRead(BaseModel):
    ranking: List[RankingEntradaRead]
    minha_posicao: Optional[int] = None


# ─── Posts (checkin photos) ───
class PostRead(BaseModel):
    id: str
    conteudo: str
    imagem_url: Optional[str] = None
    created_at: object
    usuario_nome: str

    model_config = {"from_attributes": True}


# ─── Desafios ("Reading Rats" daily check-in) ───
class DesafioRead(BaseModel):
    id: str
    titulo: str
    descricao: Optional[str] = None
    pontos_recompensa: int
    duracao_dias: Optional[int] = None
    pontos_bonus_top3: Optional[int] = None
    ativo: bool
    created_at: object

    model_config = {"from_attributes": True}


class DesafioCheckinRead(BaseModel):
    id: str
    desafio_id: str
    usuario_id: str
    post_id: Optional[str] = None
    data: object
    created_at: object

    model_config = {"from_attributes": True}
