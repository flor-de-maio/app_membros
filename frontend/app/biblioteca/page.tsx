"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, ExternalLink, Library, Loader2 } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useToast } from "@/hooks/use-toast";
import PendingApprovalScreen from "@/components/PendingApprovalScreen";
import { authFetch } from "@/lib/auth";
import MemberHeader from "@/components/MemberHeader";
import MemberNav from "@/components/MemberNav";
import Estrelas from "@/components/Estrelas";
import type { Livro } from "@/lib/types";

function LivroCard({ livro }: { livro: Livro }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const avaliarMutation = useMutation({
    mutationFn: (estrelas: number) =>
      authFetch(`/api/livros/${livro.id}/avaliacao`, {
        method: "PUT",
        body: JSON.stringify({ estrelas }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/livros"] });
      // A primeira avaliação soma pontos - o header/ranking precisam refletir.
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ranking"] });
    },
    onError: (e: Error) =>
      toast({ title: "Erro ao avaliar", description: e.message, variant: "destructive" }),
  });

  return (
    <article
      className="bg-card border border-border rounded-2xl p-4 flex gap-4"
      data-testid={`card-livro-${livro.id}`}
    >
      <div className="w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center">
        {livro.capa_url ? (
          <img
            src={livro.capa_url}
            alt={`Capa de ${livro.titulo}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <BookOpen className="w-6 h-6 text-muted-foreground" />
        )}
      </div>

      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="mono-label">{livro.mes_referencia}</span>
        <h2 className="font-serif text-base text-card-foreground leading-snug">{livro.titulo}</h2>
        {livro.autor && <p className="font-sans text-xs text-muted-foreground">{livro.autor}</p>}

        <div className="flex items-center gap-2 mt-1.5">
          <Estrelas valor={livro.media_estrelas} size="sm" />
          <span className="font-sans text-xs text-muted-foreground">
            {livro.total_avaliacoes === 0
              ? "Sem avaliações"
              : `${livro.media_estrelas?.toFixed(1)} · ${livro.total_avaliacoes} ${
                  livro.total_avaliacoes === 1 ? "avaliação" : "avaliações"
                }`}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 mt-2">
          <div className="flex items-center gap-2">
            <span className="mono-label">Sua nota</span>
            <Estrelas
              valor={livro.minha_avaliacao}
              onAvaliar={(n) => avaliarMutation.mutate(n)}
              disabled={avaliarMutation.isPending}
              size="sm"
            />
          </div>

          {livro.link && (
            <a
              href={livro.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-sans text-xs text-primary hover:opacity-80 flex-shrink-0"
              data-testid={`link-livro-${livro.id}`}
            >
              Ver livro
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function BibliotecaPage() {
  const { usuario, loading } = useAuthGuard();

  const { data: livros, isLoading } = useQuery<Livro[]>({
    queryKey: ["/api/livros"],
    queryFn: () => authFetch("/api/livros"),
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

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <MemberHeader nome={usuario.nome} isAdmin={usuario.is_admin} fotoUrl={usuario.foto_url} />

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-accent/20 border border-border flex items-center justify-center flex-shrink-0">
            <Library className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-semibold text-foreground">Biblioteca</h1>
            <p className="font-sans text-sm text-muted-foreground">
              Os livros do mês do clube. Dê suas estrelas!
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : !livros || livros.length === 0 ? (
          <p className="text-center font-sans text-sm text-muted-foreground py-8">
            Nenhum livro cadastrado ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {livros.map((livro) => (
              <LivroCard key={livro.id} livro={livro} />
            ))}
          </div>
        )}
      </main>

      <MemberNav />
    </div>
  );
}
