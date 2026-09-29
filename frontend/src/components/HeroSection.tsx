const HeroSection = () => {
  return (
    <header className="relative h-screen min-h-[600px] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/images/hero-grupo-gala.jpg"
          alt="Participantes do Flor de Maio reunidas em um encontro do clube"
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 45%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(20,28,20,0.92) 0%, rgba(20,28,20,0.5) 45%, rgba(20,28,20,0.12) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 pb-20 w-full">
        <span className="mono-label block mb-4 !text-accent">Est. 2025 · Vitória da Conquista, BA</span>
        <h1
          className="font-serif mb-5 text-card"
          style={{ fontSize: "clamp(3rem, 10vw, 6.5rem)", fontWeight: 400, lineHeight: 0.95, letterSpacing: "-0.03em" }}
        >
          Flor de <span className="italic text-primary">Maio</span>
        </h1>
        <p className="font-serif italic text-xl mb-8 max-w-lg text-card/75 leading-relaxed">
          Clube de Leitura para adoráveis mulheres.
        </p>
        <a
          href="#participar"
          className="inline-flex items-center justify-center font-mono text-xs uppercase tracking-wider px-6 py-3 bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity"
          data-testid="link-hero-participar"
        >
          Quero participar
        </a>
      </div>
    </header>
  );
};

export default HeroSection;
