const PARTICIPACOES = [
  { month: "Fevereiro 2026", book: "Jantar Secreto", author: "Raphael Montes", lido: true },
  { month: "Março 2026", book: "A sombra do vento", author: "Carlos Ruiz Zafón", lido: true },
  { month: "Abril 2026", book: "A dona da casa perfeita", author: "Liane Child", lido: true },
  {
    month: "Maio 2026",
    book: "É sempre a hora da morte amém",
    author: "Mariana Salomão Carrara",
    lido: true,
  },
  { month: "Junho 2026", book: "Pactos mortais", author: "Steve Caravanah", lido: true },
  { month: "Julho 2026", book: "Nunca Minta", author: "Freida McFadden", lido: true },
  { month: "Agosto 2026", book: "Minha adorável esposa", author: "Samantha Downing", lido: false },
  { month: "Setembro 2026", book: "Mulherzinhas", author: "Luisa May Allcot", lido: false },
  { month: "Outubro 2026", book: "O Iluminado", author: "Stephen King", lido: false },
  { month: "Novembro 2026", book: "Ainda não morri", author: "Holly Jackson", lido: false },
  { month: "Dezembro 2026", book: "Uma família feliz", author: "Raphael Montes", lido: false },
];

const PASSOS = [
  "Preencha o formulário",
  "Aguarde nosso contato",
  "Leia no seu ritmo — sem a obrigação de terminar",
  "Apareça no encontro e compartilhe suas impressões",
];

const Participacoes = () => {
  return (
    <section id="participar" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 max-w-5xl">
        <span className="mono-label block mb-4">Histórico de leituras</span>
        <h2 className="font-serif text-3xl md:text-4xl font-medium mb-3 text-foreground">Leituras de 2026</h2>
        <p className="font-sans text-[0.9375rem] leading-relaxed text-muted-foreground mb-12 max-w-xl">
          Cada mês, um novo universo. Veja o que nosso clube já leu neste ano e o que ainda vem por aí.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {PARTICIPACOES.map((p) => (
            <article
              key={p.book}
              className="p-6 bg-muted rounded-sm transition-transform duration-200 hover:-translate-y-0.5"
              data-testid={`card-participacao-${p.book}`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="mono-label">{p.month}</span>
                <span className="mono-label">{p.lido ? "lido" : "em breve"}</span>
              </div>
              <h3 className="font-sans text-sm font-semibold mb-0.5 text-foreground">{p.book}</h3>
              <p className="font-serif italic text-sm text-muted-foreground mb-4">{p.author}</p>
              <p className="font-serif italic text-sm text-foreground/50 leading-relaxed m-0">
                {p.lido ? '"Depoimento em breve."' : "Nosso próximo livro do mês."}
              </p>
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
              Nossas vagas são limitadas e abrimos a seleção de novas participantes duas vezes ao ano. Clique
              em{" "}
              <a href="#contato" className="text-accent underline underline-offset-2 hover:opacity-80">
                Participar
              </a>{" "}
              e preencha o formulário manifestando seu interesse em fazer parte do Flor de Maio. Todas as
              meninas que preencherem o formulário serão incluídas em nossa lista de prioridade e serão as
              primeiras a serem consideradas quando novas vagas forem abertas. 🌷
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
