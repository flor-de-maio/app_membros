"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RotateCcw, Shield, Trash2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PendingApprovalScreen from "@/components/PendingApprovalScreen";
import LockedOverlay from "@/components/LockedOverlay";
import { authFetch } from "@/lib/auth";
import MemberHeader from "@/components/MemberHeader";
import type { MembroAdmin } from "@/lib/types";

function MembrosTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: membros, isLoading } = useQuery<MembroAdmin[]>({
    queryKey: ["/api/usuarios"],
    queryFn: () => authFetch("/api/usuarios"),
  });

  const aprovarMutation = useMutation({
    mutationFn: (id: string) => authFetch(`/api/usuarios/${id}/aprovar`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/usuarios"] });
      toast({ title: "Membro aprovado!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const removerMutation = useMutation({
    mutationFn: (id: string) => authFetch(`/api/usuarios/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/usuarios"] });
      toast({ title: "Membro removido." });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!membros || membros.length === 0) {
    return <p className="text-center font-sans text-sm text-muted-foreground py-8">Nenhum membro cadastrado ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {membros.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-card"
          data-testid={`row-membro-${m.id}`}
        >
          <div className="min-w-0">
            <p className="font-sans text-sm text-foreground truncate">
              {m.nome}
              {m.is_admin && <span className="mono-label ml-2 align-middle">admin</span>}
            </p>
            <p className="font-sans text-xs text-muted-foreground truncate">{m.email}</p>
            <p className="mono-label mt-0.5">{m.status}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {m.status === "pendente" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => aprovarMutation.mutate(m.id)}
                disabled={aprovarMutation.isPending}
                className="gap-1.5"
                data-testid={`button-aprovar-${m.id}`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Aprovar
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-destructive gap-1.5" data-testid={`button-remover-${m.id}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                  Remover
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover {m.nome}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O membro perderá acesso à plataforma.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => removerMutation.mutate(m.id)}>Remover</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}

function RankingTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const zerarMutation = useMutation({
    mutationFn: () => authFetch("/api/ranking/zerar", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ranking"] });
      toast({ title: "Ranking zerado." });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
      <h2 className="font-serif text-base text-card-foreground">Zerar ranking</h2>
      <p className="font-sans text-sm text-muted-foreground">
        Zera a pontuação de todos os membros para 0. Use no início de um novo ciclo.
      </p>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="self-start gap-2 rounded-full" data-testid="button-zerar-ranking">
            <RotateCcw className="w-4 h-4" />
            Zerar ranking
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zerar o ranking?</AlertDialogTitle>
            <AlertDialogDescription>
              A pontuação de todos os membros será redefinida para 0. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => zerarMutation.mutate()}>Zerar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminPage() {
  const { usuario, loading } = useAuthGuard();
  const router = useRouter();

  useEffect(() => {
    if (!loading && usuario && !usuario.is_admin) {
      router.replace("/");
    }
  }, [loading, usuario, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }
  if (!usuario) return null;
  if (usuario.status === "pendente" && !usuario.is_admin) return <PendingApprovalScreen />;
  if (!usuario.is_admin) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MemberHeader nome={usuario.nome} isAdmin={usuario.is_admin} fotoUrl={usuario.foto_url} />

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-accent/20 border border-border flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-serif text-xl font-semibold text-foreground">Administração</h1>
        </div>

        <Tabs defaultValue="membros">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="membros" data-testid="tab-admin-membros">Membros</TabsTrigger>
            <TabsTrigger value="ranking" data-testid="tab-admin-ranking">Ranking</TabsTrigger>
            <TabsTrigger value="conteudo" data-testid="tab-admin-conteudo">Conteúdo</TabsTrigger>
            <TabsTrigger value="desafios" data-testid="tab-admin-desafios">Desafios</TabsTrigger>
          </TabsList>

          <TabsContent value="membros" className="pt-6">
            <MembrosTab />
          </TabsContent>

          <TabsContent value="ranking" className="pt-6">
            <RankingTab />
          </TabsContent>

          <TabsContent value="conteudo" className="pt-6">
            <LockedOverlay
              title="Gestão de conteúdo"
              description="Feed, biblioteca e livros do mês serão administrados por aqui em uma próxima fase."
            />
          </TabsContent>

          <TabsContent value="desafios" className="pt-6">
            <LockedOverlay
              title="Gestão de desafios"
              description="Criação de novos desafios (1x1, em grupo, com comprovante) chega em uma próxima fase."
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
