import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LockedOverlay from "@/components/LockedOverlay";

export default function ProdutosPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24">
        <LockedOverlay
          title="Produtos"
          description="Em breve: itens exclusivos da Flor de Maio, de camisetas a ex-libris."
        />
      </div>
      <Footer />
    </main>
  );
}
