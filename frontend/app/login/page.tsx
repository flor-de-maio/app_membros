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
import { setUserToken } from "@/lib/auth";
import type { LoginResponse } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  senha: z.string().min(1, "Senha obrigatória"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  });

  const onSubmit = async (values: LoginForm) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "E-mail ou senha incorretos");
      }
      const { token } = data as LoginResponse;
      setUserToken(token);
      router.push("/ranking");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        data-testid="link-login-inicio"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Início
      </Link>
      <div className="w-full max-w-sm bg-card border border-border rounded-sm p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-accent/30 border border-border flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-serif text-xl text-foreground">Entrar</h1>
          <p className="font-sans text-sm text-muted-foreground text-center">Flor de Maio</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mono-label">E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="seu@email.com" data-testid="input-login-email" {...field} />
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
                    <PasswordInput placeholder="••••••••" data-testid="input-login-senha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <p className="text-destructive text-xs font-sans">{error}</p>}

            <Button type="submit" disabled={loading} className="font-medium" data-testid="button-login-submit">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
            </Button>
          </form>
        </Form>

        <p className="text-center font-sans text-xs text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link href="/registro" className="text-primary hover:underline" data-testid="link-registro">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
