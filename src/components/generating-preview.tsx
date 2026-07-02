import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// A geração é uma única chamada ao modelo, sem progresso intermediário. Por
// isso a tela mostra só um cronômetro real e uma barra indeterminada, sem
// porcentagem nem etapas marcadas como concluídas.
const STEPS = [
  "Conecta ao modelo (NVIDIA) e envia o roteiro",
  "Estrutura a sequência: capa, texto bíblico, tópicos, encerramento",
  "Insere os textos bíblicos da tradução Almeida",
  "Ajusta o tamanho e a paginação ao formato de exibição",
];

interface Props {
  estimate?: number;
}

export function GeneratingPreview({ estimate = 6 }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 1000)), 250);
    return () => clearInterval(id);
  }, []);

  const cards = Math.min(8, Math.max(3, estimate));

  return (
    <div className="preview-empty-stage flex h-full min-h-[680px] flex-col rounded-lg border border-border p-6 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <span className="u-eyebrow !text-[0.6rem]">Gerando</span>
        <span className="inline-flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          {elapsed}s
        </span>
      </div>

      <h2 className="u-display mt-3 text-3xl leading-none">Estruturando sua apresentação</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        O modelo está transformando o roteiro em slides de projeção. Isso costuma levar de alguns
        segundos a cerca de um minuto — o resultado aparece aqui assim que ficar pronto.
      </p>

      <div className="mt-6">
        <div className="indeterminate-bar h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--color-surface-alt)]">
          <span className="indeterminate-bar-fill block h-full rounded-full bg-primary" />
        </div>
      </div>

      <div className="mt-6">
        <span className="u-eyebrow !text-[0.55rem] text-muted-foreground">
          O que está sendo feito
        </span>
        <ul className="mt-3 flex flex-col gap-2.5">
          {STEPS.map((step) => (
            <li key={step} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[color:var(--color-gold)]" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex-1">
        <span className="u-eyebrow !text-[0.55rem] text-muted-foreground">
          ~{cards} slides estimados
        </span>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: cards }).map((_, i) => (
            <div
              key={i}
              className="relative aspect-video overflow-hidden rounded-lg border border-border bg-[color:var(--color-surface)]"
            >
              <span className="skeleton-shimmer absolute inset-0" aria-hidden />
              <div className="relative flex h-full flex-col justify-center gap-1.5 p-3">
                <span className="h-2 w-3/4 rounded-full bg-[color:var(--color-surface-alt)]" />
                <span className="h-2 w-1/2 rounded-full bg-[color:var(--color-surface-alt)]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
        Os textos bíblicos vêm da tradução Almeida — não são escritos de memória pelo modelo.
      </p>
    </div>
  );
}
