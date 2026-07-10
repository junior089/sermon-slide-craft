import { Trash2 } from "lucide-react";

import type { SlideDeck } from "@/types/slides";

export function RecentDecks({
  decks,
  onSelect,
  onRemove,
}: {
  decks: SlideDeck[];
  onSelect: (deck: SlideDeck) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="u-eyebrow">Retomar</span>
        </div>
        <span className="text-xs text-muted-foreground">{decks.length} salvos</span>
      </div>
      <div className="divide-y divide-border border-y border-border">
        {decks.slice(0, 4).map((item) => (
          <div key={item.id} className="flex items-center gap-2 py-3">
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="min-w-0 flex-1 text-left transition-colors hover:text-muted-foreground"
            >
              <p className="line-clamp-1 text-sm font-medium text-foreground">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.slides.length} slides · ~{item.estimatedDurationMinutes} min
              </p>
            </button>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-[color:var(--color-destructive)] hover:text-[color:var(--color-destructive)]"
              aria-label={`Remover ${item.title}`}
              title="Remover do histórico"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
