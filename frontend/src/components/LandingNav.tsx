"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Sobre", id: "sobre" },
  { label: "Galeria", id: "galeria" },
  { label: "Participar", id: "participar" },
  { label: "Contato", id: "contato" },
];

/** Overlay nav for the landing hero — transparent over the photo, fades to a
 * dark blurred bar on scroll. Only used on `/`; every other page keeps the
 * plain light-background `Navbar`. */
const LandingNav = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-foreground/95 backdrop-blur-md border-b border-card/10" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif italic text-lg text-card tracking-wide"
          onClick={() => isHome && window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Flor de Maio
        </Link>

        <div className="flex items-center gap-7">
          {NAV_LINKS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="mono-label !text-card/75 hover:!text-card transition-colors hidden md:block"
            >
              {item.label}
            </button>
          ))}

          <Link
            href="/login"
            className="font-sans text-sm text-card/75 hover:text-card transition-colors hidden md:block"
            data-testid="link-nav-entrar"
          >
            Entrar
          </Link>

          <Link
            href="/registro"
            className="font-sans text-xs border border-card/30 text-card px-4 py-1.5 rounded-sm hover:bg-card/10 transition-all"
            data-testid="link-nav-registro"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default LandingNav;
