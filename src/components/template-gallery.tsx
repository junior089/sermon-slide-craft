import { useMemo, useState } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SlideCanvas } from "@/components/slide-canvas";
import { resolveLayout, TEMPLATES, TEMPLATE_LABEL } from "@/lib/slide-presets";
import type { Slide, SlideDeck, SlideTemplate } from "@/types/slides";
import { cn } from "@/lib/utils";

interface Props {
  deck: SlideDeck;
  onSelect: (template: SlideTemplate) => void;
}

export function TemplateGallery({ deck, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  const cover = deck.slides[0];
  const verseSample = useMemo<Slide | undefined>(
    () => deck.slides.find((s) => resolveLayout(s) === "scripture" && s.verse?.trim()),
    [deck.slides],
  );

  const recommended = deck.creativeDirection?.recommendedTemplate;
  const rationale = deck.creativeDirection?.visualRationale;
  const mood = deck.mood;

  const ordered = useMemo(() => {
    const score = (t: (typeof TEMPLATES)[number]) => {
      let s = 0;
      if (t.value === recommended) s += 100;
      if (mood && t.moods.includes(mood)) s += 10;
      return s;
    };
    return [...TEMPLATES].sort((a, b) => score(b) - score(a));
  }, [recommended, mood]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 w-[190px] items-center justify-between rounded-md border border-border bg-background px-3 text-sm transition-colors hover:border-primary/60"
        >
          <span className="truncate">{TEMPLATE_LABEL[deck.template]}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(94vw,680px)] p-3">
        <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Comparar temas · {TEMPLATES.length} opções
          </p>
          {recommended && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
              <Sparkles className="size-3" />
              Recomendado: {TEMPLATE_LABEL[recommended]}
            </span>
          )}
        </div>
        {rationale && (
          <p className="mb-2 rounded-md bg-[color:var(--color-surface-alt)] px-2 py-1.5 text-[11px] leading-snug text-muted-foreground">
            {rationale}
          </p>
        )}
        <div className="grid max-h-[62vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
          {ordered.map((t) => {
            const active = t.value === deck.template;
            const isRecommended = t.value === recommended;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  onSelect(t.value);
                  setOpen(false);
                }}
                className={cn(
                  "group flex flex-col gap-1 rounded-lg border p-1 text-left transition-colors",
                  active
                    ? "border-primary ring-1 ring-primary"
                    : isRecommended
                      ? "border-primary/40"
                      : "border-transparent hover:border-border",
                )}
              >
                <div className="relative flex flex-col gap-1">
                  <SlideCanvas
                    slide={cover}
                    template={t.value}
                    displayMode={deck.displayMode}
                    index={0}
                    total={deck.slides.length}
                    series={deck.series}
                    preacher={deck.preacher}
                    messageTitle={deck.title}
                    deckMotif={deck.motifs?.[0]}
                    deckMood={deck.mood}
                    accentColor={deck.accentColor}
                    churchName={deck.churchName}
                    logo={deck.logo}
                    showChrome={false}
                    className="slide-thumb-canvas"
                  />
                  {verseSample && (
                    <SlideCanvas
                      slide={verseSample}
                      template={t.value}
                      displayMode={deck.displayMode}
                      index={1}
                      total={deck.slides.length}
                      deckMotif={deck.motifs?.[0]}
                      deckMood={deck.mood}
                      accentColor={deck.accentColor}
                      showChrome={false}
                      className="slide-thumb-canvas"
                    />
                  )}
                  {active && (
                    <span className="absolute right-1.5 top-1.5 inline-flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" />
                    </span>
                  )}
                  {isRecommended && !active && (
                    <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-primary/90 px-1.5 py-0.5 text-[9px] font-medium text-primary-foreground">
                      <Sparkles className="size-2.5" />
                      IA
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between px-1 pb-0.5">
                  <span className="text-xs font-medium">{t.label}</span>
                  <span className="truncate pl-2 text-[10px] text-muted-foreground">{t.hint}</span>
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
