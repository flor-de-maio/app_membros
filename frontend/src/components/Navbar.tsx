"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const scrollTo = (id: string) => {
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  const navLinks = [
    { href: "/produtos", label: "Produtos" },
    { href: "/livros", label: "Livros" },
    { href: "/sugestoes", label: "Sugestões" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => isHome && window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span className="font-serif italic text-lg text-foreground tracking-wide">Flor de Maio</span>
        </Link>

        <div className="flex items-center gap-8">
          {[
            { label: "Sobre", id: "sobre" },
            { label: "Galeria", id: "galeria" },
            { label: "Participar", id: "participar" },
            { label: "Contato", id: "contato" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-muted-foreground hover:text-foreground text-sm font-sans tracking-wide transition-colors hidden md:block"
            >
              {item.label}
            </button>
          ))}

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-sans tracking-wide transition-colors hidden md:block ${
                pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`link-nav-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/login"
            className={`text-sm font-sans tracking-wide transition-colors hidden md:block ${
              pathname === "/login" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="link-nav-entrar"
          >
            Entrar
          </Link>

          <Link
            href="/registro"
            className="text-sm font-sans bg-primary text-primary-foreground px-5 py-2 rounded-sm hover:bg-primary/90 transition-all active:scale-[0.97]"
            data-testid="link-nav-registro"
          >
            Inscreva-se
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
