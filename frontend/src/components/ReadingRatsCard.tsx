"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, CheckCircle2, ImagePlus, Loader2, Trophy, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/lib/auth";
import type { Desafio } from "@/lib/types";

function Avatar({ fotoUrl, nome, className }: { fotoUrl: string | null; nome: string; className: string }) {
  return fotoUrl ? (
    <img src={fotoUrl} alt={nome} className={`${className} object-cover`} />
  ) : (
    <div className={`${className} bg-accent/30 border border-border flex items-center justify-center`}>
      <User className="w-1/2 h-1/2 text-primary" />
    </div>
  );
}

/* ─── Check-in composer: caption + required photo, one submit ─── */
function CheckinComposer({ desafio }: { desafio: Desafio }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [conteudo, setConteudo] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImagemChange(file: File | null) {
    setImagem(file);
    setImagemPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function resetComposer() {
    setConteudo("");
    handleImagemChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const mutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("conteudo", conteudo);
      if (imagem) formData.append("imagem", imagem);
      return authFetch(`/api/desafios/${desafio.id}/checkin`, { method: "POST", body: formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/desafios"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Check-in registrado!", description: `+${desafio.pontos_recompensa} pontos.` });
      resetComposer();
    },
    onError: (e: Error) => toast({ title: "Erro ao fazer check-in", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
        <h2 className="font-serif text-base text-card-foreground">Check-in de hoje</h2>
      </div>

      <Textarea
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        placeholder="Conte o que você está lendo hoje..."
        className="resize-none rounded-xl"
        rows={3}
        data-testid="textarea-checkin"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImagemChange(e.target.files?.[0] ?? null)}
        data-testid="input-imagem-checkin"
      />
      {imagemPreview ? (
        <div className="relative w-24">
          <img src={imagemPreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-border" />
          <button
            type="button"
            onClick={() => handleImagemChange(null)}
            className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-0.5 text-muted-foreground hover:text-foreground"
            data-testid="button-remover-imagem-checkin"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-1.5 w-full font-sans text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 border border-border rounded-full px-4 py-2.5 transition-colors"
          data-testid="button-adicionar-imagem-checkin"
        >
          <ImagePlus className="w-3.5 h-3.5" />
          Adicionar foto (obrigatório)
        </button>
      )}

      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !conteudo.trim() || !imagem}
        className="w-full rounded-full"
        data-testid="button-fazer-checkin"
      >
        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fazer check-in"}
      </Button>
    </div>
  );
}

/* ─── Card for the (single, phase-1) active Reading Rats desafio ─── */
export function ReadingRatsCard({ desafio }: { desafio: Desafio }) {
  return (
    <div className="flex flex-col gap-4" data-testid={`card-desafio-${desafio.id}`}>
      <div className="bg-primary/10 rounded-2xl p-5 flex flex-col gap-2">
        <p className="font-serif text-lg font-medium text-foreground">Normas e Prêmios</p>
        <p className="font-sans text-sm text-foreground/80 leading-relaxed">
          {desafio.descricao || "Poste uma foto da sua leitura do dia e ganhe pontos adicionais para subir no ranking."}
        </p>
        <span className="inline-flex items-center gap-1.5 self-start mt-1 font-mono text-[10px] uppercase tracking-widest text-secondary-foreground bg-secondary/90 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary-foreground/70" />
          +{desafio.pontos_recompensa} pts por check-in
          {desafio.duracao_dias ? ` · ${desafio.duracao_dias} dias` : " · sem prazo"}
        </span>
      </div>

      {desafio.ja_fez_checkin_hoje ? (
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="font-sans text-sm text-muted-foreground">Check-in de hoje já feito. Volte amanhã!</p>
        </div>
      ) : (
        <CheckinComposer desafio={desafio} />
      )}

      {desafio.ranking && desafio.ranking.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-2">
          <p className="mono-label flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            Ranking de check-ins
          </p>
          <div className="flex flex-col gap-1.5">
            {desafio.ranking.slice(0, 10).map((r, idx) => (
              <div key={r.usuario_id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-serif text-sm text-muted-foreground w-5 flex-shrink-0">{idx + 1}</span>
                  <Avatar fotoUrl={r.foto_url} nome={r.nome} className="w-6 h-6 rounded-full flex-shrink-0" />
                  <span className="font-sans text-sm text-foreground truncate">{r.nome}</span>
                </div>
                <span className="font-sans text-sm font-semibold text-primary flex-shrink-0">
                  {r.count} {r.count === 1 ? "check-in" : "check-ins"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {desafio.fotos && desafio.fotos.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-2">
          <p className="mono-label flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            Fotos recentes
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {desafio.fotos.map((f, idx) => (
              <div key={`${f.imagem_url}-${idx}`} className="relative aspect-square" data-testid={`img-checkin-${idx}`}>
                <img
                  src={f.imagem_url}
                  alt={`Check-in de ${f.nome}`}
                  title={f.nome}
                  className="w-full h-full object-cover rounded-xl border border-border"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
