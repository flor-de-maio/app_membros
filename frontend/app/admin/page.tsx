"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, ImagePlus, Loader2, Pencil, Plus, RotateCcw, Shield, Trash2, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { Livro, MembroAdmin } from "@/lib/types";

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

function BibliotecaTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [mes, setMes] = useState("");
  const [link, setLink] = useState("");
  const [capa, setCapa] = useState<File | null>(null);
  const [capaPreview, setCapaPreview] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [capaExistenteUrl, setCapaExistenteUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: livros, isLoading } = useQuery<Livro[]>({
    queryKey: ["/api/livros"],
    queryFn: () => authFetch("/api/livros"),
  });

  function handleCapaChange(file: File | null) {
    setCapa(file);
    setCapaPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function resetForm() {
    setTitulo("");
    setAutor("");
    setMes("");
    setLink("");
    setEditandoId(null);
    setCapaExistenteUrl(null);
    handleCapaChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function iniciarEdicao(livro: Livro) {
    setEditandoId(livro.id);
    setTitulo(livro.titulo);
    setAutor(livro.autor ?? "");
    setMes(livro.mes_referencia);
    setLink(livro.link ?? "");
    setCapaExistenteUrl(livro.capa_url);
    handleCapaChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const salvarMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("mes_referencia", mes);
      if (autor.trim()) formData.append("autor", autor);
      if (link.trim()) formData.append("link", link);
      // Capa vazia na edição = mantém a capa atual (ver PUT no backend).
      if (capa) formData.append("capa", capa);

      return editandoId
        ? authFetch(`/api/livros/${editandoId}`, { method: "PUT", body: formData })
        : authFetch("/api/livros", { method: "POST", body: formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/livros"] });
      toast({ title: editandoId ? "Livro atualizado!" : "Livro adicionado!" });
      resetForm();
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const removerMutation = useMutation({
    mutationFn: (id: string) => authFetch(`/api/livros/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/livros"] });
      toast({ title: "Livro removido." });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const podeSalvar = titulo.trim().length > 0 && mes.trim().length > 0 && !salvarMutation.isPending;
  // Na edição sem arquivo novo, mostra a capa que já está salva.
  const previewCapa = capaPreview ?? capaExistenteUrl;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
        <h2 className="font-serif text-base text-card-foreground">
          {editandoId ? "Editar livro" : "Adicionar livro do mês"}
        </h2>

        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="livro-titulo" className="mono-label block mb-1.5">
              Título
            </label>
            <Input
              id="livro-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Jantar Secreto"
              data-testid="input-livro-titulo"
            />
          </div>
          <div>
            <label htmlFor="livro-autor" className="mono-label block mb-1.5">
              Autor (opcional)
            </label>
            <Input
              id="livro-autor"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              placeholder="Raphael Montes"
              data-testid="input-livro-autor"
            />
          </div>
          <div>
            <label htmlFor="livro-mes" className="mono-label block mb-1.5">
              Mês
            </label>
            <Input
              id="livro-mes"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              placeholder="Fevereiro 2026"
              data-testid="input-livro-mes"
            />
          </div>
          <div>
            <label htmlFor="livro-link" className="mono-label block mb-1.5">
              Link (opcional)
            </label>
            <Input
              id="livro-link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              data-testid="input-livro-link"
            />
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleCapaChange(e.target.files?.[0] ?? null)}
          data-testid="input-imagem-livro"
        />
        {previewCapa ? (
          <div className="relative w-24">
            <img
              src={previewCapa}
              alt="Preview da capa"
              className="w-24 h-32 object-cover rounded-xl border border-border"
            />
            <button
              type="button"
              onClick={() => {
                handleCapaChange(null);
                setCapaExistenteUrl(null);
              }}
              className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-0.5 text-muted-foreground hover:text-foreground"
              data-testid="button-remover-imagem-livro"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 w-full font-sans text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 border border-border rounded-full px-4 py-2.5 transition-colors"
            data-testid="button-adicionar-imagem-livro"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            Adicionar capa
          </button>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => salvarMutation.mutate()}
            disabled={!podeSalvar}
            className="flex-1 rounded-full gap-2"
            data-testid={editandoId ? "button-salvar-livro" : "button-adicionar-livro"}
          >
            {salvarMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : editandoId ? (
              "Salvar alterações"
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Adicionar livro
              </>
            )}
          </Button>
          {editandoId && (
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={salvarMutation.isPending}
              className="rounded-full"
              data-testid="button-cancelar-edicao-livro"
            >
              Cancelar
            </Button>
          )}
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
        <div className="flex flex-col gap-2">
          {livros.map((l) => (
            <div
              key={l.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card"
              data-testid={`row-livro-${l.id}`}
            >
              <div className="w-10 h-14 flex-shrink-0 rounded-md overflow-hidden border border-border bg-muted flex items-center justify-center">
                {l.capa_url ? (
                  <img src={l.capa_url} alt={`Capa de ${l.titulo}`} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm text-foreground truncate">{l.titulo}</p>
                <p className="mono-label mt-0.5">{l.mes_referencia}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => iniciarEdicao(l)}
                  className="gap-1.5"
                  data-testid={`button-editar-livro-${l.id}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive gap-1.5"
                      data-testid={`button-remover-livro-${l.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remover
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover {l.titulo}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        O livro sai da biblioteca e as avaliações dele são apagadas. Esta ação não pode ser
                        desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removerMutation.mutate(l.id)}>Remover</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
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
            <BibliotecaTab />
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
