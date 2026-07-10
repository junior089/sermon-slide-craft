import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  Database,
  FileCode2,
  Layers,
  Server,
  Shield,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/projeto")({
  head: () => ({
    meta: [
      { title: "Sobre o projeto — Visio Divina" },
      {
        name: "description",
        content:
          "Problema, objetivos, stack e viabilidade do Visio Divina, projeto de extensão do UniCEUB que gera apresentações de pregação com um modelo de linguagem.",
      },
    ],
  }),
  component: ProjetoPage,
});

function ProjetoPage() {
  return (
    <AppShell>
      <article className="mx-auto w-full max-w-4xl px-5 py-12 md:px-8 md:py-16">
        <header className="max-w-3xl">
          <span className="u-eyebrow">Trabalho acadêmico</span>
          <h1 className="t-hero mt-5">Sobre o projeto</h1>
          <p className="t-body-lg mt-6 text-muted-foreground">
            Aplicação que converte roteiros de pregação em slides para cultos, desenvolvida como
            projeto de extensão do Centro Universitário de Brasília (UniCEUB).
          </p>
        </header>

        <Section title="Problema">
          Equipes de mídia de igrejas recebem, com frequência de última hora, roteiros de pregação
          extensos e pouco estruturados. Transformar esse material em slides claros, padronizados e
          prontos para projeção exige tempo, atenção e fidelidade à mensagem original — recursos que
          raramente estão disponíveis às vésperas de um culto.
        </Section>

        <Section title="Público-alvo">
          Equipes de mídia, pastores e líderes de ministérios que preparam apresentações para
          cultos, estudos bíblicos, reuniões de jovens e conferências.
        </Section>

        <Section title="Justificativa">
          A produção manual de slides é repetitiva e propensa a inconsistências de formatação. Um
          assistente que aplique regras claras — bullets curtos, versículos identificados, sequência
          lógica — devolve tempo à equipe e eleva o padrão visual sem comprometer o conteúdo.
        </Section>

        <Section title="Objetivo geral">
          Construir uma aplicação capaz de transformar conteúdos teológicos extensos em
          apresentações de slides claras, objetivas e fiéis à mensagem, utilizando inteligência
          artificial.
        </Section>

        <Section title="Objetivos específicos">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Definir um esquema rígido de slides (tipos, bullets e versículos).</li>
            <li>Integrar uma IA via NVIDIA NIM para gerar o conteúdo estruturado.</li>
            <li>Validar a resposta da IA com Zod para garantir consistência.</li>
            <li>Oferecer edição manual, reordenação e templates visuais.</li>
            <li>Permitir modo apresentação fullscreen e exportação simples.</li>
          </ul>
        </Section>

        <Section title="Papel da IA">
          A IA atua como assistente editorial: lê o roteiro original, identifica versículos, divide
          o conteúdo em blocos lógicos e devolve um JSON estruturado. Ela não inventa textos
          bíblicos nem altera doutrinas — segue regras explícitas no prompt do sistema. O passo a
          passo completo, com os prompts reais, está em{" "}
          <Link to="/bastidores" className="underline underline-offset-4 hover:text-foreground">
            Bastidores
          </Link>
          .
        </Section>

        <section className="mt-12 rounded-lg border border-border bg-[color:var(--color-surface-alt)] p-6 md:p-8">
          <h2 className="t-section">Stack técnica</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Tech
              icon={<FileCode2 className="size-4" />}
              label="Frontend"
              value="TanStack Start (SSR) + React 19 + TypeScript + Tailwind CSS"
            />
            <Tech
              icon={<BrainCircuit className="size-4" />}
              label="IA"
              value="NVIDIA NIM via API OpenAI-compatible (@ai-sdk/openai-compatible)"
            />
            <Tech
              icon={<Shield className="size-4" />}
              label="Validação"
              value="Zod — esquema completo da resposta da IA, com reparo de JSON"
            />
            <Tech
              icon={<Database className="size-4" />}
              label="Persistência"
              value="Supabase (RLS por usuário) com fallback para localStorage"
            />
            <Tech
              icon={<Server className="size-4" />}
              label="Server function"
              value="src/lib/generation/generate-slides.ts — chave NIM_API_KEY só no servidor"
            />
            <Tech
              icon={<Layers className="size-4" />}
              label="Exportação"
              value="Imagens PNG/ZIP, PPTX (pptxgenjs) e PDF (jsPDF)"
            />
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-border bg-[color:var(--color-surface)] p-6">
          <h2 className="t-section">Ficha</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Item label="Instituição">Centro Universitário de Brasília (UniCEUB)</Item>
            <Item label="Tipo">Projeto de extensão</Item>
            <Item label="Autores">
              Carlos Alberto Soares de Oliveira Júnior e Ítalo Kaubh Galeno de Melo
            </Item>
          </dl>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/bastidores"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Ver os bastidores técnicos <ArrowRight className="size-4" />
          </Link>
        </div>
      </article>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="t-section !text-2xl">{title}</h2>
      <div className="mt-2 leading-relaxed text-foreground">{children}</div>
    </section>
  );
}

function Tech({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-background p-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)]">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="u-eyebrow !text-[0.62rem]">{label}</div>
        <div className="text-sm">{value}</div>
      </div>
    </div>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="u-eyebrow !text-[0.62rem]">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}
