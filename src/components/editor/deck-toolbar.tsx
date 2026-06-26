import { Play, Redo2, Undo2 } from "lucide-react";

import { BrandControls } from "@/components/brand-controls";
import { BehindTheScenesPanel } from "@/components/editor/behind-the-scenes-panel";
import { ExportActions } from "@/components/export-actions";
import { TemplateGallery } from "@/components/template-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DISPLAY_MODES, TEMPLATE_ACCENT } from "@/lib/slide-presets";
import { cn } from "@/lib/utils";
import type { DisplayMode, SlideDeck } from "@/types/slides";

interface Props {
  deck: SlideDeck;
  onUpdate: (deck: SlideDeck) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onPresent: () => void;
}

export function DeckToolbar({
  deck,
  onUpdate,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onPresent,
}: Props) {
  return (
    <div className="flex flex-col gap-5 border-b border-border bg-card px-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="u-eyebrow !text-[0.62rem]">Deck aberto</span>
          <Input
            value={deck.title}
            onChange={(e) => onUpdate({ ...deck, title: e.target.value })}
            className="u-display mt-2 h-auto border-0 bg-transparent p-0 text-3xl shadow-none focus-visible:ring-0"
          />
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{deck.summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "border-border",
              deck.source === "ai"
                ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-foreground)]"
                : "bg-[#fff1ec] text-[#8a2d1a]",
            )}
          >
            {deck.source === "ai" ? "Estrutura pronta" : "Prévia local"}
          </Badge>
          <Badge variant="outline" className="border-border">
            ~{deck.estimatedDurationMinutes} min
          </Badge>
          <Badge variant="outline" className="border-border">
            {deck.slides.length} slides
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Tema</span>
            <TemplateGallery deck={deck} onSelect={(template) => onUpdate({ ...deck, template })} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Exibição
            </span>
            <Select
              value={deck.displayMode}
              onValueChange={(v) => onUpdate({ ...deck, displayMode: v as DisplayMode })}
            >
              <SelectTrigger className="h-10 w-[170px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISPLAY_MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Cor</span>
            <label
              className="relative inline-flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-border bg-background"
              title="Cor de marca (sobrescreve o acento do tema)"
            >
              <span
                className="size-5 rounded-full border border-black/10"
                style={{ background: deck.accentColor ?? TEMPLATE_ACCENT[deck.template] }}
              />
              <input
                type="color"
                value={deck.accentColor ?? TEMPLATE_ACCENT[deck.template]}
                onChange={(e) => onUpdate({ ...deck, accentColor: e.target.value })}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Cor de marca"
              />
            </label>
            {deck.accentColor && (
              <button
                type="button"
                onClick={() => onUpdate({ ...deck, accentColor: undefined })}
                className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Padrão
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Marca</span>
            <BrandControls deck={deck} onChange={(patch) => onUpdate({ ...deck, ...patch })} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Desfazer"
              title="Desfazer (Ctrl/Cmd+Z)"
            >
              <Undo2 className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Refazer"
              title="Refazer (Ctrl/Cmd+Shift+Z)"
            >
              <Redo2 className="size-4" />
            </Button>
          </div>
          <Button
            size="sm"
            onClick={onPresent}
            className="rounded-full bg-primary px-4 text-primary-foreground hover:bg-primary/90"
          >
            <Play className="mr-1.5 size-4" /> Apresentar
          </Button>
          <ExportActions deck={deck} />
        </div>
      </div>

      <BehindTheScenesPanel deck={deck} />
    </div>
  );
}
