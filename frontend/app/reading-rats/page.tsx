"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Loader2 } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PendingApprovalScreen from "@/components/PendingApprovalScreen";
import { authFetch } from "@/lib/auth";
import MemberHeader from "@/components/MemberHeader";
import MemberNav from "@/components/MemberNav";
import { ReadingRatsCard } from "@/components/ReadingRatsCard";
import type { Desafio } from "@/lib/types";

export default function ReadingRatsPage() {
  const { usuario, loading } = useAuthGuard();

  const { data: desafios, isLoading } = useQuery<Desafio[]>({
    queryKey: ["/api/desafios"],
    queryFn: () => authFetch("/api/desafios"),
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

  const desafiosAtivos = (desafios ?? []).filter((d) => d.ativo);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <MemberHeader nome={usuario.nome} isAdmin={usuario.is_admin} fotoUrl={usuario.foto_url} />

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-accent/20 border border-border flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-semibold text-foreground">Reading Rats</h1>
            <p className="font-sans text-sm text-muted-foreground">Poste uma foto lendo todo dia e ganhe pontos.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : desafiosAtivos.length === 0 ? (
          <p className="text-center font-sans text-sm text-muted-foreground py-8">
            Nenhum desafio ativo no momento.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {desafiosAtivos.map((desafio) => (
              <ReadingRatsCard key={desafio.id} desafio={desafio} />
            ))}
          </div>
        )}
      </main>

      <MemberNav />
    </div>
  );
}
