"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";

/**
 * Reusable "em desenvolvimento" lock, shared by full-page stubs (feed,
 * biblioteca, desafios, produtos, sugestões, livros) and by the two locked
 * TabsContent panes in /admin ("Conteúdo", "Desafios").
 *
 * `children` (if given) render blurred behind the overlay as a preview; if
 * omitted, a generic placeholder block of skeleton shapes is shown instead.
 */
export default function LockedOverlay({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative min-h-[320px] flex items-center justify-center py-16 px-4">
      <div className="absolute inset-0 blur-sm pointer-events-none select-none" aria-hidden="true">
        {children ?? <DefaultPlaceholder />}
      </div>

      <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-3 text-center shadow-sm">
        <div className="w-11 h-11 rounded-full bg-accent/30 border border-border flex items-center justify-center">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <span className="mono-label">Em desenvolvimento</span>
        <h2 className="font-serif text-xl text-card-foreground">{title}</h2>
        {description && <p className="font-sans text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

function DefaultPlaceholder() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-3 w-1/3 bg-muted rounded-sm" />
            <div className="h-3 w-2/3 bg-muted rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
