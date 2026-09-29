// Lean types matching the phase-1 backend API contract for Flor de Maio.

export type StatusMembro = "pendente" | "aprovado";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  pontos: number;
  is_admin: boolean;
  foto_url: string | null;
  bio: string | null;
  status: StatusMembro;
  created_at: string;
}

// Shape returned by the admin's GET /api/usuarios.
export type MembroAdmin = Usuario;

export interface RankingEntry {
  usuario_id: string;
  nome: string;
  foto_url: string | null;
  bio: string | null;
  pontos: number;
}

export interface RankingResponse {
  ranking: RankingEntry[];
  minha_posicao: number | null;
}

/* ─── Desafios (Reading Rats, phase 1) ─── */

export interface DesafioCheckinRankingEntry {
  usuario_id: string;
  nome: string;
  foto_url: string | null;
  count: number;
}

export interface DesafioCheckinFoto {
  nome: string;
  imagem_url: string;
  created_at: string;
}

export interface Desafio {
  id: string;
  titulo: string;
  descricao: string | null;
  pontos_recompensa: number;
  duracao_dias: number | null;
  ativo: boolean;
  ranking: DesafioCheckinRankingEntry[];
  fotos: DesafioCheckinFoto[];
  ja_fez_checkin_hoje: boolean;
}

/* ─── Biblioteca (livros do mês + avaliações) ─── */

export interface Livro {
  id: string;
  titulo: string;
  autor: string | null;
  mes_referencia: string;
  capa_url: string | null;
  link: string | null;
  created_at: string;
  media_estrelas: number | null;
  total_avaliacoes: number;
  minha_avaliacao: number | null;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  usuario: Usuario;
}
