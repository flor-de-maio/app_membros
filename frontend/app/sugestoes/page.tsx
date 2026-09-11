import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LockedOverlay from "@/components/LockedOverlay";

export default function SugestoesPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24">
        <LockedOverlay
          title="Sugestões"
          description="Em breve: sugira o próximo livro do mês para o clube."
        />
      </div>
      <Footer />
    </main>
  );
}
