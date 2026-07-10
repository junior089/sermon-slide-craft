import { Check } from "lucide-react";

const STEPS = ["Roteiro", "Geração", "Revisão", "Apresentação"];

export function FlowRail({ hasDeck }: { hasDeck: boolean }) {
  return (
    <div className="grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-4">
      {STEPS.map((item, index) => {
        const active = index === 0 || (hasDeck && index < 3);
        return (
          <div
            key={item}
            className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
          >
            <span
              className={
                active
                  ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[0.62rem] font-medium text-primary-foreground"
                  : "flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-[0.62rem] text-muted-foreground"
              }
            >
              {hasDeck && index < 3 ? <Check className="size-3.5" /> : String(index + 1)}
            </span>
            <span
              className={
                active
                  ? "u-eyebrow !text-[0.68rem] text-foreground"
                  : "u-eyebrow !text-[0.68rem] text-muted-foreground"
              }
            >
              {item}
            </span>
          </div>
        );
      })}
    </div>
  );
}
