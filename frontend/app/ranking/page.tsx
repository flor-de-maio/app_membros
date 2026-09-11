"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarCheck, Crown, Loader2, Trophy, User } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PendingApprovalScreen from "@/components/PendingApprovalScreen";
import { authFetch } from "@/lib/auth";
import MemberHeader from "@/components/MemberHeader";
import MemberNav from "@/components/MemberNav";
import type { RankingResponse } from "@/lib/types";

function Avatar({ fotoUrl, nome, className }: { fotoUrl: string | null; nome: string; className: string }) {
  return fotoUrl ? (
    <img src={fotoUrl} alt={nome} className={`${className} object-cover`} />
  ) : (
    <div className={`${className} bg-accent/30 border border-border flex items-center justify-center`}>
      <User className="w-1/2 h-1/2 text-primary" />
    </div>
  );
}

export default function RankingPage() {
  const { usuario, loading } = useAuthGuard();

  const { data, isLoading } = useQuery<RankingResponse>({
    queryKey: ["/api/ranking"],
    queryFn: () => authFetch("/api/ranking"),
    enabled: !!usuario,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }
  if (!usuario) return null;
  if (usuario.status === "pendente" && !usuario.is_admin) return <PendingApprovalScreen />;

  const ranking = data?.ranking ?? [];
  const minhaPosicao = data?.minha_posicao ?? undefined;
  const [primeiro, segundo, terceiro] = ranking;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <MemberHeader nome={usuario.nome} isAdmin={usuario.is_admin} fotoUrl={usuario.foto_url} />

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-8">
        <div className="text-center">
          <span className="mono-label">Sua posição</span>
          <p className="font-serif text-3xl text-primary mt-1" data-testid="text-minha-posicao">
            {minhaPosicao ? `#${minhaPosicao}` : "—"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-sm p-5 flex flex-col gap-4">
          <h2 className="font-serif text-base text-card-foreground">Como ganhar pontos</h2>
          <div className="flex items-start gap-3">
            <CalendarCheck className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="font-sans text-sm text-muted-foreground">
              Check-in no Reading Rats: <span className="font-semibold text-primary">+pontos por dia</span>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="font-sans text-sm text-muted-foreground">
              Mais formas de pontuar chegam nas próximas fases da plataforma.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : ranking.length === 0 ? (
          <p className="text-center font-sans text-sm text-muted-foreground py-8">Ninguém no ranking ainda.</p>
        ) : (
          <>
            {/* Pódio */}
            <div className="flex items-end justify-center gap-4">
              {segundo && (
                <div className="flex flex-col items-center gap-1" data-testid="podium-2">
                  <Avatar fotoUrl={segundo.foto_url} nome={segundo.nome} className="w-14 h-14 rounded-full" />
                  <p className="font-sans text-xs text-foreground text-center max-w-[70px] truncate">{segundo.nome}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{segundo.pontos} pts</p>
                </div>
              )}
              {primeiro && (
                <div className="flex flex-col items-center gap-1 -mt-4" data-testid="podium-1">
                  <Crown className="w-5 h-5 text-primary" />
                  <Avatar
                    fotoUrl={primeiro.foto_url}
                    nome={primeiro.nome}
                    className="w-20 h-20 rounded-full border-2 border-primary"
                  />
                  <p className="font-sans text-sm text-foreground font-semibold text-center max-w-[90px] truncate">
                    {primeiro.nome}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">{primeiro.pontos} pts</p>
                </div>
              )}
              {terceiro && (
                <div className="flex flex-col items-center gap-1" data-testid="podium-3">
                  <Avatar fotoUrl={terceiro.foto_url} nome={terceiro.nome} className="w-14 h-14 rounded-full" />
                  <p className="font-sans text-xs text-foreground text-center max-w-[70px] truncate">{terceiro.nome}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{terceiro.pontos} pts</p>
                </div>
              )}
            </div>

            {/* Lista completa */}
            <div className="flex flex-col gap-2">
              {ranking.map((entry, idx) => {
                const posicao = idx + 1;
                const isVoce = entry.usuario_id === usuario.id;
                return (
                  <div
                    key={entry.usuario_id}
                    className={`flex items-center justify-between gap-2 px-4 py-3 rounded-sm border ${
                      isVoce ? "bg-accent/20 border-primary/40" : "bg-card border-border"
                    }`}
                    data-testid={`row-ranking-${posicao}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-serif text-sm text-muted-foreground w-6 flex-shrink-0">{posicao}</span>
                      <Avatar fotoUrl={entry.foto_url} nome={entry.nome} className="w-7 h-7 rounded-full flex-shrink-0" />
                      <span className="font-sans text-sm text-foreground truncate">
                        {entry.nome}
                        {isVoce && <span className="text-primary"> (você)</span>}
                      </span>
                    </div>
                    <span className="font-sans text-sm font-semibold text-primary flex-shrink-0">
                      <Trophy className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                      {entry.pontos} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <MemberNav />
    </div>
  );
}
