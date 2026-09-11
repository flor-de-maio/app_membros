"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const CONTACT_INFO = [
  { label: "E-mail", value: "contato@flordemaio.com.br" },
  { label: "WhatsApp", value: "(77) 9 9876-5432" },
  { label: "Localização", value: "Vitória da Conquista, BA" },
  { label: "Encontros", value: "Primeira sexta de cada mês, 19h" },
];

const Contato = () => {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contato" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 max-w-5xl grid md:grid-cols-2 gap-16 items-start">
        <div>
          <span className="mono-label block mb-4">Fale conosco</span>
          <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4 text-foreground">Entre em contato</h2>
          <p className="font-sans text-[0.9375rem] leading-relaxed text-muted-foreground mb-10 max-w-[42ch]">
            Tem dúvidas, quer participar ou simplesmente quer conversar sobre livros? A gente adoraria ouvir
            você.
          </p>
          <div className="space-y-5">
            {CONTACT_INFO.map((c) => (
              <div key={c.label}>
                <span className="mono-label block mb-1">{c.label}</span>
                <p className="font-sans text-sm text-foreground m-0">{c.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          {submitted ? (
            <div className="p-8 text-center bg-muted rounded-sm" data-testid="text-contato-sucesso">
              <p className="font-serif italic text-2xl text-secondary mb-2">Mensagem recebida!</p>
              <p className="font-sans text-sm text-muted-foreground">
                Obrigada pelo contato. Retornaremos em breve com mais informações sobre o próximo encontro.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="mono-label block mb-1.5">
                  Seu nome
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Como podemos te chamar?"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                  data-testid="input-contato-nome"
                />
              </div>
              <div>
                <label htmlFor="email" className="mono-label block mb-1.5">
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                  data-testid="input-contato-email"
                />
              </div>
              <div>
                <label htmlFor="message" className="mono-label block mb-1.5">
                  Mensagem
                </label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder="Conte um pouco sobre você e por que quer participar..."
                  required
                  value={formState.message}
                  onChange={(e) => setFormState((prev) => ({ ...prev, message: e.target.value }))}
                  className="resize-none"
                  data-testid="input-contato-mensagem"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="submit" data-testid="button-contato-enviar">
                  Enviar mensagem
                </Button>
                <Button variant="secondary" asChild>
                  <a href="https://wa.me/5577998765432" data-testid="link-contato-whatsapp">
                    WhatsApp
                  </a>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contato;
