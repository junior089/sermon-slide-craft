import { useMemo, useRef } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Copy as CopyIcon,
  Image,
  ImagePlus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { IconButton } from "@/components/editor/icon-button";
import { InfoLine } from "@/components/editor/info-line";
import {
  reviewSlide,
  validateBackgroundImage,
  type ReviewItem,
} from "@/components/editor/slide-review";
import { SlideCanvas } from "@/components/slide-canvas";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getTypeLabel } from "@/lib/export/files";
import { readImageFile } from "@/lib/read-image-file";
import { LAYOUTS, maxBulletCharsFor, maxBulletsFor, resolveLayout } from "@/lib/slide-presets";
import { cn } from "@/lib/utils";
import type { Slide, SlideDeck, SlideLayout } from "@/types/slides";

const MAX_BG_BYTES = 4_000_000;

const SLIDE_TYPES = [
  "title",
  "topic",
  "verse",
  "reflection",
  "application",
  "conclusion",
] as const satisfies readonly Slide["type"][];

const FIELD_LABEL =
  "text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" as const;

interface Props {
  deck: SlideDeck;
  index: number;
  onUpdateSlide: (patch: Partial<Slide>) => void;
  onMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function SlideEditor({ deck, index, onUpdateSlide, onMove, onDuplicate, onRemove }: Props) {
  const slide = deck.slides[index];
  const maxBullets = maxBulletsFor(deck.displayMode);
  const maxBulletChars = maxBulletCharsFor(deck.displayMode);
  const review = useMemo(() => reviewSlide(slide, deck.displayMode), [deck.displayMode, slide]);
  const bgImageWarning = useMemo(
    () => validateBackgroundImage(slide.backgroundImage),
    [slide.backgroundImage],
  );

  const bgFileRef = useRef<HTMLInputElement>(null);
  function onPickBackground(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    readImageFile(file, MAX_BG_BYTES)
      .then((backgroundImage) => {
        onUpdateSlide({ backgroundImage });
        toast.success("Imagem de fundo aplicada a este slide.");
      })
      .catch((err: Error) => toast.error(err.message));
  }

  return (
    <div className="flex min-w-0 flex-col gap-4 p-4 md:p-5">
      <div className="slide-stage">
        <SlideCanvas
          slide={slide}
          template={deck.template}
          displayMode={deck.displayMode}
          index={index}
          total={deck.slides.length}
          series={deck.series}
          preacher={deck.preacher}
          messageTitle={deck.title}
          deckMotif={deck.motifs?.[0]}
          deckMood={deck.mood}
          accentColor={deck.accentColor}
          churchName={deck.churchName}
          logo={deck.logo}
        />
      </div>

      <ReviewPanel items={review} />

      <SlideMeaningPanel slide={slide} />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-[color:var(--color-surface-alt)] px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-border">
            {getTypeLabel(slide.type)}
          </Badge>
          <span className="text-muted-foreground">Slide {index + 1}</span>
        </div>
        <div className="flex gap-1">
          <IconButton label="Subir" onClick={() => onMove(-1)} disabled={index === 0}>
            <ArrowUp className="size-4" />
          </IconButton>
          <IconButton
            label="Descer"
            onClick={() => onMove(1)}
            disabled={index === deck.slides.length - 1}
          >
            <ArrowDown className="size-4" />
          </IconButton>
          <IconButton label="Duplicar" onClick={onDuplicate}>
            <CopyIcon className="size-4" />
          </IconButton>
          <IconButton
            label="Remover"
            onClick={onRemove}
            disabled={deck.slides.length <= 1}
            destructive
          >
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL}>Tipo</label>
          <Select
            value={slide.type}
            onValueChange={(v) => onUpdateSlide({ type: v as Slide["type"] })}
          >
            <SelectTrigger className="h-11 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SLIDE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {getTypeLabel(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL}>Subtítulo</label>
          <Input
            value={slide.subtitle ?? ""}
            onChange={(e) => onUpdateSlide({ subtitle: e.target.value })}
            className="h-11 bg-background"
            placeholder="(opcional)"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL}>Composição (layout)</label>
          <Select
            value={resolveLayout(slide)}
            onValueChange={(v) => onUpdateSlide({ layout: v as SlideLayout })}
          >
            <SelectTrigger className="h-11 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LAYOUTS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label className="flex min-h-11 cursor-pointer select-none items-center gap-2.5 self-end rounded-md border border-border bg-background px-3 py-2.5">
          <Checkbox
            checked={!!slide.highlight}
            onCheckedChange={(v) => onUpdateSlide({ highlight: Boolean(v) })}
          />
          <span className="text-sm font-medium">Slide em destaque</span>
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={FIELD_LABEL}>Título do slide</label>
        <Input
          value={slide.title}
          onChange={(e) => onUpdateSlide({ title: e.target.value })}
          className="h-11 bg-background"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={FIELD_LABEL}>Tópicos (um por linha, máx. {maxBullets})</label>
        <Textarea
          value={slide.bullets.join("\n")}
          onChange={(e) =>
            onUpdateSlide({
              bullets: e.target.value
                .split("\n")
                .map((b) => b.slice(0, maxBulletChars))
                .filter((b) => b.trim().length > 0)
                .slice(0, maxBullets),
            })
          }
          className="min-h-[112px] bg-background text-sm"
          placeholder="Cada linha vira um tópico."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={FIELD_LABEL}>Texto bíblico (opcional)</label>
        <Textarea
          value={slide.verse ?? ""}
          onChange={(e) => onUpdateSlide({ verse: e.target.value })}
          className="min-h-[76px] bg-background font-serif italic"
          placeholder="Cite apenas versículos presentes no texto original."
        />
        <Input
          value={slide.reference ?? ""}
          onChange={(e) => onUpdateSlide({ reference: e.target.value })}
          className="h-11 bg-background"
          placeholder="Referência, por exemplo: Daniel 3.17"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL}>Imagem de fundo</label>
          <div className="flex gap-2">
            <Input
              value={slide.backgroundImage ?? ""}
              onChange={(e) => onUpdateSlide({ backgroundImage: e.target.value })}
              className="h-11 bg-background"
              placeholder="URL da imagem (https:// ou data:)"
            />
            <IconButton label="Enviar imagem" onClick={() => bgFileRef.current?.click()}>
              <ImagePlus className="size-4" />
            </IconButton>
            <IconButton
              label="Limpar imagem"
              onClick={() => onUpdateSlide({ backgroundImage: undefined })}
              disabled={!slide.backgroundImage}
            >
              <Image className="size-4" />
            </IconButton>
            <input
              ref={bgFileRef}
              type="file"
              accept="image/*"
              onChange={onPickBackground}
              className="hidden"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Envie um arquivo (recomendado) ou cole uma URL. O upload evita falhas de exportação por
            imagens de outra origem.
          </p>
          {bgImageWarning && (
            <p className="text-xs text-[color:var(--color-gold)]">{bgImageWarning}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={FIELD_LABEL}>Direção visual</label>
          <Input
            value={slide.visualHint}
            onChange={(e) => onUpdateSlide({ visualHint: e.target.value })}
            className="h-11 bg-background"
            placeholder="Ex.: fogo baixo, silhueta, textura de papel"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={FIELD_LABEL}>Nota do operador de mídia</label>
        <Textarea
          value={slide.speakerNote}
          onChange={(e) => onUpdateSlide({ speakerNote: e.target.value })}
          className="min-h-[88px] bg-background text-sm"
        />
      </div>
    </div>
  );
}

function ReviewPanel({ items }: { items: ReviewItem[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.slice(0, 4).map((item) => (
        <div
          key={item.text}
          className={cn(
            "flex items-start gap-2 rounded-md border px-3 py-2 text-xs",
            item.type === "ok"
              ? "border-[color:var(--color-success)]/30 bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]"
              : "border-[color:var(--color-gold)]/35 bg-[color:var(--color-gold)]/10 text-foreground",
          )}
        >
          {item.type === "ok" ? (
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-[color:var(--color-gold)]" />
          )}
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

function SlideMeaningPanel({ slide }: { slide: Slide }) {
  const direction = slide.visualDirection;
  if (!slide.rhetoricalRole && !slide.visualRole && !direction) return null;
  const directionText = direction
    ? [
        direction.atmosphere && `atmosfera: ${direction.atmosphere}`,
        direction.background && `fundo: ${direction.background}`,
        direction.symbol && `símbolo: ${direction.symbol}`,
        direction.treatment && `tratamento: ${direction.treatment}`,
        direction.intensity && `intensidade: ${direction.intensity}`,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <div className="grid gap-2 rounded-lg border border-border bg-[color:var(--color-surface-alt)] p-3 text-sm sm:grid-cols-3">
      <InfoLine label="Função retórica" value={slide.rhetoricalRole} />
      <InfoLine label="Função visual" value={slide.visualRole} />
      <InfoLine label="Direção visual" value={directionText || "Não informada"} />
    </div>
  );
}
