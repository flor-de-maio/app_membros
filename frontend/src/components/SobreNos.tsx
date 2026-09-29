const STATS = [
  { n: "+15", label: "Membros" },
  { n: "19", label: "Lidos" },
  { n: "1a8m", label: "De clube" },
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
                O <em>Flor de Maio</em> nasceu do desejo e da necessidade de construir um forte laço afetivo
                com outras pessoas por meio da leitura. E claro, desabrochou da vontade de cultivar amizades
                genuínas, apoio e companheirismo entre mulheres.
              </p>
              <p>
                Há mais de um ano, nos encontramos mensalmente para conversar sobre as obras escolhidas,
                compartilhar nossas vivências e saborear comidas deliciosas pela cidade. Nossos livros são
                sorteados a cada semestre e, ao longo dessa caminhada, já passamos por suspenses, clássicos,
                romances, fantasias e o que mais sentimos que toca nossos corações.
              </p>
              <p>
                Se você sente que compartilha dos mesmos ideais,{" "}
                <a href="#participar" className="text-primary underline underline-offset-2 hover:opacity-80">
                  clique em PARTICIPAR
                </a>
                . Quem sabe você não será a próxima flor a brotar em nosso jardim?
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

          <div>
            <img
              src="/images/sobre-grupo-mesa.jpg"
              alt="Encontro do Flor de Maio ao redor da mesa"
              className="w-full h-[500px] object-cover rounded-sm bg-muted"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SobreNos;
