import LandingNav from "@/components/LandingNav";
import HeroSection from "@/components/HeroSection";
import SobreNos from "@/components/SobreNos";
import Galeria from "@/components/Galeria";
import Participacoes from "@/components/Participacoes";
import Contato from "@/components/Contato";
import Footer from "@/components/Footer";

export default function Index() {
  return (
    <main className="min-h-screen">
      <LandingNav />
      <HeroSection />
      <SobreNos />
      <Galeria />
      <Participacoes />
      <Contato />
      <Footer />
    </main>
  );
}
