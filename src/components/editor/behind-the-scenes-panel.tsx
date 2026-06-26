import { Badge } from "@/components/ui/badge";
import { InfoLine } from "@/components/editor/info-line";
import { TEMPLATE_LABEL } from "@/lib/slide-presets";
import type { SlideDeck } from "@/types/slides";

export function BehindTheScenesPanel({ deck }: { deck: SlideDeck }) {
  const direction = deck.creativeDirection;
  const trace = deck.aiTrace;
  if (!direction && !trace) return null;

  const recommendedTemplate = direction?.recommendedTemplate;
  const selectedTemplate = trace?.selectedTemplate ?? deck.template;

  return (
    <details className="rounded-lg border border-border bg-[color:var(--color-surface-alt)]">
      <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-3 p-3 marker:hidden">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Bastidores da geração
          </span>
          <h3 className="mt-1 text-sm font-semibold text-foreground">
            Como a apresentação foi definida
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="border-border">
            {trace?.provider === "nvidia" ? "NVIDIA" : "Demonstração local"}
          </Badge>
          <Badge variant="outline" className="border-border">
            Tema: {TEMPLATE_LABEL[selectedTemplate]}
          </Badge>
          {recommendedTemplate && (
            <Badge variant="outline" className="border-border">
              Recomendado: {TEMPLATE_LABEL[recommendedTemplate]}
            </Badge>
          )}
        </div>
      </summary>

      <div className="border-t border-border p-3">
        {direction && (
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <InfoLine label="Tema central" value={direction.centralTheme} />
            <InfoLine label="Movimento" value={direction.sermonMovement} />
            <InfoLine label="Tese" value={direction.sermonThesis} wide />
            <InfoLine label="Tom pastoral" value={direction.pastoralTone} />
            <InfoLine label="Texto base" value={direction.biblicalAnchor || "Não identificado"} />
            <InfoLine label="Tom visual" value={direction.recommendedMood} />
            <InfoLine
              label="Motivos"
              value={
                direction.recommendedMotifs.length
                  ? direction.recommendedMotifs.join(", ")
                  : "Nenhum motivo dominante"
              }
            />
            <InfoLine
              label="Arco emocional"
              value={
                direction.emotionalArc.length ? direction.emotionalArc.join(" → ") : "Não informado"
              }
            />
            <InfoLine label="Justificativa visual" value={direction.visualRationale} wide />
            {direction.avoidVisuals.length > 0 && (
              <InfoLine label="Evitar" value={direction.avoidVisuals.join(", ")} wide />
            )}
          </div>
        )}

        {trace && (
          <div className="mt-3 grid gap-2">
            <div className="rounded-md border border-border bg-background p-2 text-xs text-muted-foreground">
              <div>
                <strong className="font-medium text-foreground">Modelo:</strong> {trace.model}
                {trace.baseURL ? ` · ${trace.baseURL}` : ""}
              </div>
              <div>
                <strong className="font-medium text-foreground">Aplicação do tema:</strong>{" "}
                {trace.usedRecommendedTemplate
                  ? "o app aplicou o template recomendado pelo modelo."
                  : "o app manteve o template escolhido pelo usuário ou o padrão."}
              </div>
              {trace.notes.length > 0 && <div className="mt-1">{trace.notes.join(" ")}</div>}
            </div>

            <TraceDetails title="Prompt enviado" content={formatPrompt(trace.prompt)} />
            <TraceDetails title="Resposta bruta recebida" content={trace.rawResponse} />
            {trace.repair && (
              <TraceDetails
                title="Reparo de JSON"
                content={`Erro de validação:\n${trace.repair.validationError}\n\nPrompt de reparo:\n${formatPrompt(trace.repair.prompt)}\n\nResposta reparada:\n${trace.repair.rawResponse || "(sem resposta registrada)"}`}
              />
            )}
          </div>
        )}
      </div>
    </details>
  );
}

function TraceDetails({ title, content }: { title: string; content: string }) {
  return (
    <details className="rounded-md border border-border bg-background">
      <summary className="cursor-pointer px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </summary>
      <pre className="max-h-72 overflow-auto border-t border-border p-3 text-xs leading-relaxed text-foreground">
        {content}
      </pre>
    </details>
  );
}

function formatPrompt(prompt: { system: string; user: string }) {
  return `SYSTEM\n${prompt.system}\n\nUSER\n${prompt.user}`;
}
