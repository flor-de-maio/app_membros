"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/PasswordInput";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const registroSchema = z
  .object({
    nome: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres").max(150),
    email: z.string().trim().email("E-mail inválido"),
    senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmarSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });
type RegistroForm = z.infer<typeof registroSchema>;

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const form = useForm<RegistroForm>({
    resolver: zodResolver(registroSchema),
    defaultValues: { nome: "", email: "", senha: "", confirmarSenha: "" },
  });

  const onSubmit = async (values: RegistroForm) => {
    setLoading(true);
    setError("");
    try {
      // POST /api/auth/registro returns 201 with no token - new users start
      // status "pendente" and must log in separately once approved.
      const res = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: values.nome, email: values.email, senha: values.senha }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao cadastrar");
      }
      setSucesso(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
        <Link
          href="/"
          className="absolute top-6 left-6 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          data-testid="link-registro-sucesso-inicio"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Início
        </Link>
        <div className="w-full max-w-sm bg-card border border-border rounded-sm p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-accent/30 border border-border flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-serif text-xl text-foreground">Cadastro recebido!</h1>
          <p className="font-sans text-sm text-muted-foreground">
            Seu cadastro foi enviado e está aguardando aprovação de um administrador. Assim que for
            liberado, você poderá entrar normalmente.
          </p>
          <Button onClick={() => router.push("/login")} data-testid="button-ir-para-login">
            Ir para o login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10 relative">
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        data-testid="link-registro-inicio"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Início
      </Link>
      <div className="w-full max-w-sm bg-card border border-border rounded-sm p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-accent/30 border border-border flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-serif text-xl text-foreground">Criar conta</h1>
          <p className="font-sans text-sm text-muted-foreground text-center">Flor de Maio</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mono-label">Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" data-testid="input-registro-nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mono-label">E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="seu@email.com" data-testid="input-registro-email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mono-label">Senha</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" data-testid="input-registro-senha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmarSenha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mono-label">Confirmar senha</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" data-testid="input-registro-confirmar-senha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <p className="text-destructive text-xs font-sans">{error}</p>}

            <Button type="submit" disabled={loading} className="font-medium" data-testid="button-registro-submit">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cadastrar"}
            </Button>
          </form>
        </Form>

        <p className="text-center font-sans text-xs text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
