const PARTICIPACOES = [
  {
    month: "Agosto 2025",
    book: "A Hora da Estrela",
    author: "Clarice Lispector",
    members: 14,
    score: "4.8/5",
    note: "Uma leitura tocante sobre existência e invisibilidade. Debatemos por mais de três horas.",
  },
  {
    month: "Setembro 2025",
    book: "Torto Arado",
    author: "Itamar Vieira Junior",
    members: 17,
    score: "4.9/5",
    note: "Vozes femininas, terra e resistência. Encontro marcante com discussões sobre identidade e memória.",
  },
  {
    month: "Outubro 2025",
    book: "O Alienista",
    author: "Machado de Assis",
    members: 12,
    score: "4.5/5",
    note: "Ironia, poder e loucura — Machado em seu melhor. Risadas e reflexões em igual medida.",
  },
  {
    month: "Novembro 2025",
    book: "Americanah",
    author: "Chimamanda Ngozi Adichie",
    members: 19,
    score: "5.0/5",
    note: "Diáspora, raça e amor. Uma das leituras mais ricas do ano, com perspectivas muito diversas.",
  },
];

const PASSOS = [
  "Entre em contato pelo formulário ou WhatsApp",
  "Receba o livro do mês por e-mail",
  "Leia no seu ritmo — sem obrigação de terminar",
  "Apareça no encontro e compartilhe sua leitura",
];

const Participacoes = () => {
  return (
    <section id="participar" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 max-w-5xl">
        <span className="mono-label block mb-4">Histórico de leituras</span>
        <h2 className="font-serif text-3xl md:text-4xl font-medium mb-3 text-foreground">Participações recentes</h2>
        <p className="font-sans text-[0.9375rem] leading-relaxed text-muted-foreground mb-12 max-w-xl">
          Cada mês, um novo universo. Veja o que nosso clube tem explorado e o que nossos membros pensaram
          sobre cada obra.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {PARTICIPACOES.map((p) => (
            <article
              key={p.book}
              className="p-6 bg-muted rounded-sm transition-transform duration-200 hover:-translate-y-0.5"
              data-testid={`card-participacao-${p.book}`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="mono-label">{p.month}</span>
                <span className="font-mono text-xs font-medium text-primary">{p.score}</span>
              </div>
              <h3 className="font-sans text-sm font-semibold mb-0.5 text-foreground">{p.book}</h3>
              <p className="font-serif italic text-sm text-muted-foreground mb-3">{p.author}</p>
              <p className="font-sans text-sm text-foreground/80 leading-relaxed m-0">{p.note}</p>
              <div className="mt-4">
                <span className="mono-label">{p.members} participantes</span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 p-8 md:p-12 grid md:grid-cols-2 gap-10 items-start bg-secondary rounded-sm">
          <div>
            <span className="mono-label block mb-4 !text-secondary-foreground/55">Como entrar</span>
            <h3 className="font-serif italic text-2xl font-medium mb-4 text-secondary-foreground">
              Venha ler com a gente
            </h3>
            <p className="font-sans text-sm leading-relaxed text-secondary-foreground/80 m-0">
              A participação é gratuita e aberta a todos. O próximo encontro acontece na{" "}
              <strong className="text-accent">primeira sexta de cada mês</strong>, às 19h — de forma híbrida
              (presencial em Vitória da Conquista e online via Google Meet).
            </p>
          </div>
          <ol className="space-y-4">
            {PASSOS.map((step, i) => (
              <li key={step} className="flex gap-3 items-start">
                <span className="shrink-0 w-6 h-6 flex items-center justify-center font-mono text-xs bg-primary text-primary-foreground rounded-sm">
                  {i + 1}
                </span>
                <span className="font-sans text-sm text-secondary-foreground/80 leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default Participacoes;
