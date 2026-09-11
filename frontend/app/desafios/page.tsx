"use client";

import { Loader2 } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PendingApprovalScreen from "@/components/PendingApprovalScreen";
import MemberHeader from "@/components/MemberHeader";
import MemberNav from "@/components/MemberNav";
import LockedOverlay from "@/components/LockedOverlay";

export default function DesafiosPage() {
  const { usuario, loading } = useAuthGuard();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }
  if (!usuario) return null;
  if (usuario.status === "pendente" && !usuario.is_admin) return <PendingApprovalScreen />;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <MemberHeader nome={usuario.nome} isAdmin={usuario.is_admin} fotoUrl={usuario.foto_url} />
      <main className="max-w-2xl mx-auto">
        <LockedOverlay
          title="Desafios"
          description="Em breve: desafios 1 contra 1 e em grupo, além do Reading Rats diário."
        />
      </main>
      <MemberNav />
    </div>
  );
}
