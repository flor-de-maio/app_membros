"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CAROUSEL_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1611994138603-64e4e8a62451?w=800&h=600&fit=crop&auto=format",
    alt: "Livro branco sobre flores amarelas",
  },
  {
    url: "https://images.unsplash.com/photo-1630343710506-89f8b9f21d31?w=800&h=600&fit=crop&auto=format",
    alt: "Pessoa lendo livro em ambiente aconchegante",
  },
  {
    url: "https://images.unsplash.com/photo-1603831905217-8c2f485a2e20?w=800&h=600&fit=crop&auto=format",
    alt: "Mulher lendo livro",
  },
  {
    url: "https://images.unsplash.com/photo-1598024055266-e772a5f8c128?w=800&h=600&fit=crop&auto=format",
    alt: "Mulher de camisa vermelha lendo",
  },
  {
    url: "https://images.unsplash.com/photo-1588287028941-99e3c7601d0e?w=800&h=600&fit=crop&auto=format",
    alt: "Flores sobre papel impresso",
  },
  {
    url: "https://images.unsplash.com/photo-1725582204163-46d1f246ecd6?w=800&h=600&fit=crop&auto=format",
    alt: "Pessoa sentada com livro e café",
  },
];

const Galeria = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((p) => (p + 1) % CAROUSEL_IMAGES.length);
    }, 4200);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const goTo = (i: number) => {
    setCurrentSlide(i);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((p) => (p + 1) % CAROUSEL_IMAGES.length);
    }, 4200);
  };

  return (
    <section id="galeria" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="mono-label block mb-2">Galeria</span>
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground">Momentos do clube</h2>
          </div>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => goTo((currentSlide - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)}
              className="w-9 h-9 flex items-center justify-center border border-border bg-card text-muted-foreground rounded-sm hover:opacity-80 transition-colors"
              aria-label="Anterior"
              data-testid="button-galeria-anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goTo((currentSlide + 1) % CAROUSEL_IMAGES.length)}
              className="w-9 h-9 flex items-center justify-center border border-border bg-card text-muted-foreground rounded-sm hover:opacity-80 transition-colors"
              aria-label="Próximo"
              data-testid="button-galeria-proximo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-sm" style={{ height: "420px" }}>
          {CAROUSEL_IMAGES.map((img, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === currentSlide ? 1 : 0, zIndex: i === currentSlide ? 1 : 0 }}
            >
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover bg-muted" />
            </div>
          ))}
        </div>

        <div className="flex gap-1.5 mt-3">
          {CAROUSEL_IMAGES.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="flex-1 h-14 overflow-hidden rounded-sm transition-all duration-300"
              style={{
                opacity: i === currentSlide ? 1 : 0.38,
                outline: i === currentSlide ? "2px solid var(--primary)" : "none",
                outlineOffset: "2px",
              }}
              aria-label={`Foto ${i + 1}`}
              data-testid={`button-galeria-thumb-${i}`}
            >
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Galeria;
