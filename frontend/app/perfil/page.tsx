"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Check, Loader2, LogOut, Pencil, Shield, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";
import { useToast } from "@/hooks/use-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PendingApprovalScreen from "@/components/PendingApprovalScreen";
import { authFetch, clearUserToken } from "@/lib/auth";
import MemberHeader from "@/components/MemberHeader";
import MemberNav from "@/components/MemberNav";

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function membroDesde(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

function TrocarSenhaForm() {
  const { toast } = useToast();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      authFetch("/api/auth/senha", {
        method: "POST",
        body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha }),
      }),
    onSuccess: () => {
      toast({ title: "Senha alterada com sucesso!" });
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    },
    onError: (e: Error) => toast({ title: "Erro ao trocar senha", description: e.message, variant: "destructive" }),
  });

  const podeSalvar = senhaAtual.length > 0 && novaSenha.length >= 6 && novaSenha === confirmarSenha;

  return (
    <div className="bg-card border border-border rounded-sm p-4 flex flex-col gap-3">
      <h2 className="font-serif text-sm text-card-foreground">Trocar senha</h2>
      <div className="flex flex-col gap-2">
        <PasswordInput
          placeholder="Senha atual"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          data-testid="input-senha-atual"
        />
        <PasswordInput
          placeholder="Nova senha"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          data-testid="input-nova-senha"
        />
        <PasswordInput
          placeholder="Confirmar nova senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          data-testid="input-confirmar-nova-senha"
        />
        {novaSenha.length > 0 && novaSenha !== confirmarSenha && (
          <p className="font-sans text-xs text-destructive">As senhas não coincidem</p>
        )}
      </div>
      <Button
        size="sm"
        className="self-end"
        disabled={!podeSalvar || mutation.isPending}
        onClick={() => mutation.mutate()}
        data-testid="button-trocar-senha"
      >
        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar nova senha"}
      </Button>
    </div>
  );
}

export default function PerfilPage() {
  const { usuario, loading } = useAuthGuard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const [editandoNome, setEditandoNome] = useState(false);
  const [nomeInput, setNomeInput] = useState("");
  const [editandoBio, setEditandoBio] = useState(false);
  const [bioInput, setBioInput] = useState("");

  const nomeMutation = useMutation({
    mutationFn: (nome: string) => authFetch("/api/auth/me", { method: "PATCH", body: JSON.stringify({ nome }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Nome atualizado!" });
      setEditandoNome(false);
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const bioMutation = useMutation({
    mutationFn: (bio: string) => authFetch("/api/auth/me", { method: "PATCH", body: JSON.stringify({ bio }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Bio atualizada!" });
      setEditandoBio(false);
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const fotoMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("foto", file);
      return authFetch("/api/auth/me/foto", { method: "POST", body: formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Foto de perfil atualizada!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
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

  const handleLogout = () => {
    clearUserToken();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <MemberHeader nome={usuario.nome} isAdmin={usuario.is_admin} fotoUrl={usuario.foto_url} />

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-primary" />
          <h1 className="font-serif text-xl text-foreground">Perfil</h1>
        </div>

        <div className="bg-card border border-border rounded-sm p-6 flex flex-col items-center gap-4">
          <div className="relative">
            {usuario.foto_url ? (
              <img
                src={usuario.foto_url}
                alt={usuario.nome}
                className="w-16 h-16 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-accent/30 border border-border flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
            )}
            <input
              ref={fotoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) fotoMutation.mutate(file);
                e.target.value = "";
              }}
              data-testid="input-foto-perfil"
            />
            <button
              type="button"
              onClick={() => fotoInputRef.current?.click()}
              disabled={fotoMutation.isPending}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background"
              data-testid="button-editar-foto-perfil"
            >
              {fotoMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
            </button>
          </div>
          <div className="text-center w-full">
            {editandoNome ? (
              <div className="flex items-center gap-1.5 justify-center">
                <Input
                  value={nomeInput}
                  onChange={(e) => setNomeInput(e.target.value)}
                  autoFocus
                  className="h-8 text-center max-w-[200px]"
                  data-testid="input-editar-nome"
                />
                <button
                  type="button"
                  onClick={() => nomeInput.trim().length >= 2 && nomeMutation.mutate(nomeInput.trim())}
                  disabled={nomeMutation.isPending || nomeInput.trim().length < 2}
                  className="text-primary hover:text-primary/80 disabled:opacity-40 flex-shrink-0"
                  data-testid="button-salvar-nome"
                >
                  {nomeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setEditandoNome(false)}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                  data-testid="button-cancelar-nome"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                <h2 className="font-serif text-lg text-foreground" data-testid="text-perfil-nome">
                  {usuario.nome}
                </h2>
                <button
                  type="button"
                  onClick={() => { setNomeInput(usuario.nome); setEditandoNome(true); }}
                  className="text-muted-foreground hover:text-primary"
                  data-testid="button-editar-nome"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="font-sans text-xs text-muted-foreground">Membro desde {membroDesde(usuario.created_at)}</p>
            {editandoBio ? (
              <div className="flex items-center gap-1.5 w-full mt-2">
                <Input
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Uma frase sobre você..."
                  maxLength={160}
                  autoFocus
                  className="h-8 text-xs"
                  data-testid="input-editar-bio"
                />
                <button
                  type="button"
                  onClick={() => bioMutation.mutate(bioInput.trim())}
                  disabled={bioMutation.isPending}
                  className="text-primary hover:text-primary/80 disabled:opacity-40 flex-shrink-0"
                  data-testid="button-salvar-bio"
                >
                  {bioMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setEditandoBio(false)}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                  data-testid="button-cancelar-bio"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setBioInput(usuario.bio ?? ""); setEditandoBio(true); }}
                className="font-sans text-xs text-muted-foreground italic hover:text-primary mt-1 text-center"
                data-testid="button-editar-bio"
              >
                {usuario.bio || "+ adicionar uma mini bio"}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 w-full pt-4 border-t border-border">
            <div className="flex flex-col items-center gap-0.5" data-testid="stat-pontos">
              <span className="font-serif text-lg text-primary">{usuario.pontos}</span>
              <span className="mono-label">Pontos</span>
            </div>
            <div className="flex flex-col items-center gap-0.5" data-testid="stat-status">
              <span className="font-serif text-lg text-foreground capitalize">{usuario.status}</span>
              <span className="mono-label">Status</span>
            </div>
          </div>
        </div>

        <TrocarSenhaForm />

        <div className="flex flex-col gap-2">
          {usuario.is_admin && (
            <Button variant="outline" asChild className="justify-start gap-2">
              <Link href="/admin" data-testid="link-perfil-admin">
                <Shield className="w-4 h-4" />
                Painel de administração
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={handleLogout} className="justify-start gap-2" data-testid="button-logout-perfil">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </main>

      <MemberNav />
    </div>
  );
}
