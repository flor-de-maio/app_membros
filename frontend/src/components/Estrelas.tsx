"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const TOTAL = 5;

interface EstrelasProps {
  /** Nota atual. Em modo leitura aceita a média fracionada do clube (ex.: 4.3). */
  valor: number | null;
  /** Quando definido, o widget vira interativo e chama isto ao clicar. */
  onAvaliar?: (estrelas: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

/** Estrelas de 1 a 5. Sem `onAvaliar` é só leitura (usado para a média do
 * clube); com `onAvaliar` mostra o hover e permite escolher a nota. */
export default function Estrelas({ valor, onAvaliar, disabled = false, size = "md" }: EstrelasProps) {
  const [hover, setHover] = useState<number | null>(null);
  const interativo = Boolean(onAvaliar);
  const atual = valor ?? 0;
  const exibido = hover ?? atual;
  const preenchidas = interativo ? exibido : Math.round(exibido);
  const dimensao = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";

  return (
    <div
      className="flex items-center gap-0.5"
      role={interativo ? "radiogroup" : "img"}
      aria-label={interativo ? "Sua avaliação" : `Média de ${atual} de ${TOTAL} estrelas`}
      onMouseLeave={() => interativo && setHover(null)}
    >
      {Array.from({ length: TOTAL }, (_, i) => i + 1).map((n) => {
        const ativa = n <= preenchidas;
        const icone = (
          <Star
            className={`${dimensao} ${ativa ? "text-primary fill-current" : "text-muted-foreground/40"}`}
          />
        );

        if (!interativo) {
          return <span key={n}>{icone}</span>;
        }

        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onAvaliar?.(n)}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            className="disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-110"
            aria-label={`Avaliar com ${n} ${n === 1 ? "estrela" : "estrelas"}`}
            aria-checked={n === atual}
            role="radio"
            data-testid={`button-estrela-${n}`}
          >
            {icone}
          </button>
        );
      })}
    </div>
  );
}
