const PARTICIPACOES = [
  { month: "Fevereiro 2026", book: "Jantar Secreto", author: "Raphael Montes" },
  { month: "Junho 2025", book: "A Guerra da Papoula", author: "R.F. Kuang" },
  { month: "Maio 2025", book: "Tudo Que Deixamos Inacabado", author: "Rebecca Yarros" },
  { month: "Março 2025", book: "Orgulho e Preconceito", author: "Jane Austen" },
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
              <span className="mono-label block mb-3">{p.month}</span>
              <h3 className="font-sans text-sm font-semibold mb-0.5 text-foreground">{p.book}</h3>
              <p className="font-serif italic text-sm text-muted-foreground mb-4">{p.author}</p>
              <p className="font-serif italic text-sm text-foreground/50 leading-relaxed m-0">
                "Depoimento em breve."
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
