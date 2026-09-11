"use client";

import { Clock3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearUserToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function PendingApprovalScreen() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-sm p-8 flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-accent/30 border border-border flex items-center justify-center">
          <Clock3 className="w-5 h-5 text-primary" />
        </div>
        <h1 className="font-serif text-lg font-semibold text-foreground">Aguardando aprovação</h1>
        <p className="font-sans text-sm text-muted-foreground">
          Seu cadastro foi recebido e está aguardando a aprovação de um administrador. Assim que for
          liberado, você poderá acessar normalmente.
        </p>
        <Button
          variant="outline"
          onClick={() => { clearUserToken(); router.replace("/login"); }}
          className="gap-2 mt-2"
          data-testid="button-pending-logout"
        >
          <LogOut className="w-4 h-4" />Sair
        </Button>
      </div>
    </div>
  );
}
