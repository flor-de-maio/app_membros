"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <p className="mono-label mb-3">Página não encontrada</p>
        <h1 className="mb-4 font-serif text-4xl italic text-foreground">Esta página se perdeu entre as páginas</h1>
        <Link href="/" className="text-primary underline underline-offset-4 hover:text-primary/80">
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
