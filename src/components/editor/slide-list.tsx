import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { SlideCanvas } from "@/components/slide-canvas";
import { getTypeLabel } from "@/lib/export/files";
import { cn } from "@/lib/utils";
import type { SlideDeck } from "@/types/slides";

interface Props {
  deck: SlideDeck;
  selected: number;
  onSelect: (index: number) => void;
  onReorder: (from: number, to: number) => void;
  onAdd: () => void;
}

export function SlideList({ deck, selected, onSelect, onReorder, onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const filteredSlides = useMemo(() => {
    const term = query.trim().toLowerCase();
    const all = deck.slides.map((slide, index) => ({ slide, index }));
    if (!term) return all;
    return all.filter(({ slide: s, index }) =>
      [
        String(index + 1),
        getTypeLabel(s.type),
        s.title,
        s.subtitle,
        s.verse,
        s.reference,
        s.speakerNote,
        s.visualHint,
        ...s.bullets,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [deck.slides, query]);

  const draggable = !query.trim();

  function resetDrag() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  return (
    <aside className="preview-sidebar max-h-[640px] overflow-y-auto border-b border-border bg-[color:var(--color-surface)] p-3 lg:max-h-none lg:border-b-0 lg:border-r">
      <label className="mb-3 flex h-10 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-muted-foreground">
        <Search className="size-4" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar slides"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>
      {draggable && (
        <p className="mb-2 px-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Arraste para reordenar
        </p>
      )}
      <ul className="flex gap-2 lg:flex-col">
        {filteredSlides.map(({ slide: s, index: i }) => (
          <li
            key={s.id}
            className={cn(
              "shrink-0 lg:shrink",
              draggable &&
                dragOverIndex === i &&
                dragIndex !== i &&
                "rounded-lg ring-2 ring-primary",
              draggable && dragIndex === i && "opacity-40",
            )}
            draggable={draggable}
            onDragStart={() => draggable && setDragIndex(i)}
            onDragOver={(e) => {
              if (!draggable || dragIndex === null) return;
              e.preventDefault();
              setDragOverIndex(i);
            }}
            onDrop={(e) => {
              if (!draggable || dragIndex === null) return;
              e.preventDefault();
              onReorder(dragIndex, i);
              resetDrag();
            }}
            onDragEnd={resetDrag}
          >
            <button
              onClick={() => onSelect(i)}
              className={cn(
                "slide-thumb group flex w-[210px] flex-col gap-1 rounded-lg border bg-background p-1 text-left transition-colors lg:w-full",
                draggable && "cursor-grab active:cursor-grabbing",
                i === selected
                  ? "border-primary bg-white shadow-sm"
                  : "border-transparent hover:border-border",
              )}
            >
              <SlideCanvas
                slide={s}
                template={deck.template}
                displayMode={deck.displayMode}
                index={i}
                total={deck.slides.length}
                series={deck.series}
                preacher={deck.preacher}
                deckMotif={deck.motifs?.[0]}
                deckMood={deck.mood}
                accentColor={deck.accentColor}
                churchName={deck.churchName}
                logo={deck.logo}
                showChrome={false}
                className="slide-thumb-canvas"
              />
              <div className="flex items-center justify-between px-1 pb-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>{getTypeLabel(s.type)}</span>
              </div>
            </button>
          </li>
        ))}
        {filteredSlides.length === 0 && (
          <li className="rounded-md border border-border px-3 py-6 text-center text-xs text-muted-foreground">
            Nenhum slide encontrado.
          </li>
        )}
        <li>
          <button
            onClick={onAdd}
            className="flex h-full w-[210px] min-h-[118px] items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-background text-xs text-muted-foreground hover:border-primary hover:text-foreground lg:w-full"
          >
            <Plus className="size-3.5" /> Adicionar slide
          </button>
        </li>
      </ul>
    </aside>
  );
}
