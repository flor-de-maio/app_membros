import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LockedOverlay from "@/components/LockedOverlay";

export default function LivrosPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24">
        <LockedOverlay
          title="Livros"
          description="Em breve: o catálogo de livros já lidos e recomendados pelo clube."
        />
      </div>
      <Footer />
    </main>
  );
}
