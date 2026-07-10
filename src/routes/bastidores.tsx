import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { rolePermissions } from "@/lib/auth/roles";
import { useAuth } from "@/lib/auth/use-auth";
import { listDecks } from "@/lib/storage/deck-repository";
import { buildSlidesPrompt } from "@/lib/generation/prompt";
import { TEMPLATE_LABEL } from "@/lib/slide-presets";
import type { GenerationInput } from "@/lib/generation/schemas";
import type { SlideDeck } from "@/types/slides";

export const Route = createFileRoute("/bastidores")({
  head: () => ({
    meta: [
      { title: "Bastidores — Visio Divina" },
      {
        name: "description",
        content:
          "Pipeline de geração: prompt enviado ao modelo, resposta bruta, reparo de JSON e validação com Zod.",
      },
    ],
  }),
  component: BastidoresPage,
});

const SAMPLE_INPUT: GenerationInput = {
  theme: "A fé no meio do fogo",
  series: "Série: Fornalha",
  preacher: "Pr. Exemplo",
  preferredTemplate: "cinematic",
  templateLocked: false,
  text: "Daniel 3 — Sadraque, Mesaque e Abede-Nego diante da fornalha. A fé que confia mesmo sem garantia de livramento. Aplicação: permanecer fiel sob pressão; adorar antes de ver o resultado. Versículo-chave: Daniel 3:17.",
  style: "culto-principal",
  density: "equilibrado",
  displayMode: "telao",
  translation: "almeida",
  highlightVerses: true,
  generateOperatorNotes: true,
  suggestBlocks: true,
};

const PIPELINE = [
  {
    n: 1,
    title: "Entrada do roteiro",
    text: "O operador cola o roteiro/esboço. O texto fica no navegador até o envio.",
    ref: "src/components/generator-form.tsx",
  },
  {
    n: 2,
    title: "Server function",
    text: "Uma server function monta o prompt e chama a NVIDIA NIM (endpoint OpenAI-compatible). A chave NIM_API_KEY fica só no servidor.",
    ref: "src/lib/generation/generate-slides.ts",
  },
  {
    n: 3,
    title: "Montagem do prompt",
    text: "system + user são construídos com regras invioláveis, guia de templates e o texto bíblico já resolvido.",
    ref: "src/lib/generation/prompt.ts",
  },
  {
    n: 4,
    title: "Validação Zod",
    text: "A resposta é parseada e validada contra o schema. Se falhar, dispara um prompt de reparo de JSON.",
    ref: "src/lib/generation/schemas.ts",
  },
  {
    n: 5,
    title: "Normalização",
    text: "Paginação de versículos longos, defaults defensivos e mapeamento para o modelo de slides.",
    ref: "src/lib/generation/normalizer.ts",
  },
  {
    n: 6,
    title: "Render & export",
    text: "Os slides editáveis são montados; o operador revisa, apresenta e exporta imagens.",
    ref: "src/components/slide-preview.tsx",
  },
];

function BastidoresPage() {
  const { user, loading, role } = useAuth();
  const allowed = rolePermissions(role).canSeeBastidores;
  const [latest, setLatest] = useState<SlideDeck | null>(null);

  useEffect(() => {
    if (loading) return;
    let active = true;
    listDecks(user?.id ?? null).then((decks) => {
      if (active) setLatest(decks.find((d) => d.aiTrace) ?? decks[0] ?? null);
    });
    return () => {
      active = false;
    };
  }, [user, loading]);

  const basePrompt = useMemo(() => buildSlidesPrompt(SAMPLE_INPUT), []);
  const trace = latest?.aiTrace;
  const direction = latest?.creativeDirection;

  if (!loading && !allowed) {
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-md px-5 py-20 text-center">
          <span className="u-eyebrow">Acesso restrito</span>
          <h1 className="t-section mt-4">Modo acadêmico indisponível</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Esta área expõe prompts e detalhes técnicos da geração. Peça a um administrador o papel
            de acesso adequado.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-5xl px-5 py-10 md:px-8 md:py-12">
        <section className="band">
          <span className="u-eyebrow text-white/65">Modo acadêmico</span>
          <h1 className="t-hero mt-4 max-w-3xl text-white">Por baixo dos panos</h1>
          <p className="t-body-lg mt-5 max-w-2xl text-white/75">
            O caminho técnico do roteiro até os slides: o pipeline, o prompt enviado ao modelo, a
            resposta bruta e a validação de cada geração.
          </p>
        </section>

        <section className="mt-12">
          <span className="u-eyebrow">Pipeline</span>
          <h2 className="t-section mt-3">Do roteiro à apresentação</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-2">
            {PIPELINE.map((step) => (
              <li
                key={step.n}
                className="flex gap-4 rounded-lg border border-border bg-[color:var(--color-surface)] p-5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {step.n}
                </span>
                <div className="min-w-0">
                  <h3 className="t-card !text-lg">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                  <code className="mt-2 inline-block break-all rounded bg-background px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {step.ref}
                  </code>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <span className="u-eyebrow">Prompts</span>
          <h2 className="t-section mt-3">O prompt enviado à IA</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Montado em <code className="font-mono">buildSlidesPrompt()</code>. Abaixo, o prompt-base
            gerado a partir de um roteiro de demonstração — system (regras) e user (conteúdo).
          </p>
          <div className="mt-5 grid gap-4">
            <CodeBlock title="SYSTEM (regras invioláveis)" content={basePrompt.system} />
            <CodeBlock title="USER (conteúdo do roteiro)" content={basePrompt.user} />
          </div>
        </section>

        <section className="mt-12">
          <span className="u-eyebrow">Trace</span>
          <h2 className="t-section mt-3">Última geração registrada</h2>
          {trace ? (
            <div className="mt-5 grid gap-4">
              <div className="grid gap-2 rounded-lg border border-border bg-[color:var(--color-surface)] p-4 text-sm sm:grid-cols-2">
                <Fact
                  label="Provedor"
                  value={trace.provider === "nvidia" ? "NVIDIA NIM" : "Demonstração local"}
                />
                <Fact label="Modelo" value={trace.model} />
                <Fact
                  label="Template aplicado"
                  value={TEMPLATE_LABEL[trace.selectedTemplate ?? latest!.template]}
                />
                <Fact
                  label="Aplicou recomendação?"
                  value={trace.usedRecommendedTemplate ? "Sim" : "Não"}
                />
                {trace.baseURL && <Fact label="Endpoint" value={trace.baseURL} wide />}
                {trace.notes.length > 0 && (
                  <Fact label="Notas" value={trace.notes.join(" ")} wide />
                )}
              </div>

              <CodeBlock
                title="Prompt enviado (deste deck)"
                content={`SYSTEM\n${trace.prompt.system}\n\nUSER\n${trace.prompt.user}`}
              />
              <CodeBlock title="Resposta bruta da IA" content={trace.rawResponse} />
              {trace.repair && (
                <CodeBlock
                  title="Reparo de JSON (validação Zod falhou)"
                  content={`Erro de validação:\n${trace.repair.validationError}\n\nPrompt de reparo:\nSYSTEM\n${trace.repair.prompt.system}\n\nUSER\n${trace.repair.prompt.user}\n\nResposta reparada:\n${trace.repair.rawResponse || "(sem resposta registrada)"}`}
                />
              )}

              {direction && (
                <div className="grid gap-2 rounded-lg border border-border bg-[color:var(--color-surface)] p-4 text-sm sm:grid-cols-2">
                  <Fact label="Tema central" value={direction.centralTheme} />
                  <Fact label="Tese" value={direction.sermonThesis} wide />
                  <Fact label="Mood recomendado" value={direction.recommendedMood} />
                  <Fact label="Arco emocional" value={direction.emotionalArc.join(" → ") || "—"} />
                </div>
              )}
            </div>
          ) : (
            <p className="mt-5 rounded-lg border border-dashed border-border bg-[color:var(--color-surface)] p-6 text-sm text-muted-foreground">
              Nenhuma geração registrada ainda. Gere um deck no{" "}
              <a href="/gerar" className="underline underline-offset-4 hover:text-foreground">
                Editor
              </a>{" "}
              para ver aqui o prompt real, a resposta bruta e o reparo de JSON.
            </p>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Fact({ label, value, wide }: { label: string; value?: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <div className="u-eyebrow !text-[0.6rem]">{label}</div>
      <div className="mt-0.5 text-sm text-foreground">{value || "—"}</div>
    </div>
  );
}

function CodeBlock({ title, content }: { title: string; content: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Sem permissão de clipboard: o usuário ainda pode selecionar o texto.
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-[color:var(--color-surface-alt)] px-3 py-2">
        <span className="u-eyebrow !text-[0.62rem]">{title}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="max-h-96 overflow-auto p-3 font-mono text-xs leading-relaxed text-foreground">
        {content}
      </pre>
    </div>
  );
}
