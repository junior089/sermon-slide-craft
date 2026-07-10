import { Clock, FileStack, Wand2, type LucideIcon } from "lucide-react";

import type { SlideDeck } from "@/types/slides";

export function DeckSnapshot({ deck }: { deck: SlideDeck }) {
  const highlighted = deck.slides.filter((slide) => slide.highlight).length;
  const scripture = deck.slides.filter((slide) => slide.type === "verse").length;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <SnapshotItem
        icon={FileStack}
        label="Estrutura"
        value={`${deck.slides.length} slides`}
        detail={`${highlighted} destaques`}
      />
      <SnapshotItem
        icon={Clock}
        label="Duração"
        value={`~${deck.estimatedDurationMinutes} min`}
        detail={deck.displayMode === "telao" ? "otimizado para telão" : "modo ajustável"}
      />
      <SnapshotItem
        icon={Wand2}
        label="Conteúdo bíblico"
        value={`${scripture} slides`}
        detail={deck.source === "ai" ? "gerado pelo modelo" : "prévia local"}
      />
    </div>
  );
}

function SnapshotItem({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-[color:var(--color-surface)] transition-colors group-hover:border-primary/60">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="u-eyebrow block !text-[0.62rem]">{label}</span>
        <strong className="block text-sm">{value}</strong>
        <span className="block truncate text-xs text-muted-foreground">{detail}</span>
      </span>
    </div>
  );
}
