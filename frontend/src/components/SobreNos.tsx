const STATS = [
  { n: "48+", label: "Membros" },
  { n: "36", label: "Livros lidos" },
  { n: "3", label: "Anos" },
];

const SobreNos = () => {
  return (
    <section id="sobre" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <span className="mono-label block mb-4">Sobre o clube</span>
            <h2 className="font-serif text-3xl md:text-4xl font-medium mb-6 text-foreground">
              Um espaço íntimo para leituras compartilhadas
            </h2>
            <div className="font-sans text-[0.9375rem] leading-relaxed text-foreground space-y-4">
              <p>
                A <em>Flor de Maio</em> nasceu do desejo de criar um espaço íntimo onde a literatura não é
                apenas lida, mas vivida. Nos reunimos mensalmente para debater uma obra escolhida em
                conjunto — clássicos brasileiros, literatura africana, obras contemporâneas e muito mais.
              </p>
              <p>
                Cada encontro é regado a chá, afeto e conversas que ficam muito além das últimas páginas.
                Acreditamos que ler em comunidade transforma tanto o livro quanto a pessoa que o lê.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-px mt-12 bg-border">
              {STATS.map((s) => (
                <div key={s.label} className="text-center py-6 bg-card">
                  <div className="font-serif text-3xl font-medium text-primary">{s.n}</div>
                  <span className="mono-label block mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1608499500238-1536c6dd482f?w=700&h=900&fit=crop&auto=format"
              alt="Mulher lendo livro"
              className="w-full h-[500px] object-cover rounded-sm bg-muted"
            />
            <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-secondary rounded-b-sm">
              <p className="font-serif italic text-base text-secondary-foreground m-0">
                "Uma leitura envolvente do início ao fim."
              </p>
              <span className="mono-label block mt-1.5 !text-secondary-foreground/60">
                Ana Clara · membro desde 2022
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SobreNos;
