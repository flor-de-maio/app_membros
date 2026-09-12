"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Shield, User } from "lucide-react";
import { clearUserToken } from "@/lib/auth";

export default function MemberHeader({
  nome,
  isAdmin,
  fotoUrl,
}: {
  nome: string;
  isAdmin?: boolean;
  fotoUrl?: string | null;
}) {
  const router = useRouter();

  const handleLogout = () => {
    clearUserToken();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/perfil"
          className="flex items-center gap-2 min-w-0 pl-1 pr-3 py-1 rounded-full hover:bg-muted transition-colors"
          data-testid="link-perfil-header"
        >
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={nome}
              className="w-7 h-7 rounded-full object-cover border border-border flex-shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-accent/30 border border-border flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
          )}
          <span className="font-sans text-sm text-foreground truncate" data-testid="text-member-nome">
            {nome}
          </span>
        </Link>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary hover:border-primary/40 text-xs font-sans border border-border rounded-full px-3 py-1.5 transition-colors"
              data-testid="link-admin"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary text-xs font-sans px-2 py-1.5 transition-colors"
            data-testid="button-logout-member"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
