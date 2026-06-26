import { useRef } from "react";
import { BadgeCheck, ChevronDown, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { readImageFile } from "@/lib/read-image-file";
import { getBrandKit, hasBrandKit, saveBrandKit } from "@/lib/storage/brand-kit";
import type { SlideDeck } from "@/types/slides";

interface Props {
  deck: SlideDeck;
  onChange: (patch: Partial<SlideDeck>) => void;
}

const MAX_LOGO_BYTES = 500_000;

export function BrandControls({ deck, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    readImageFile(file, MAX_LOGO_BYTES)
      .then((logo) => onChange({ logo }))
      .catch((err: Error) => toast.error(err.message));
  }

  function saveKit() {
    saveBrandKit({
      churchName: deck.churchName,
      logo: deck.logo,
      accentColor: deck.accentColor,
      template: deck.template,
    });
    toast.success("Marca da igreja salva. Será aplicada a novos decks.");
  }

  function applyKit() {
    const kit = getBrandKit();
    onChange({
      churchName: kit.churchName,
      logo: kit.logo,
      accentColor: kit.accentColor ?? deck.accentColor,
      template: kit.template ?? deck.template,
    });
    toast.success("Marca aplicada a este deck.");
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm transition-colors hover:border-primary/60"
        >
          {deck.logo ? (
            <img src={deck.logo} alt="" className="size-5 rounded object-contain" />
          ) : (
            <BadgeCheck className="size-4 text-muted-foreground" />
          )}
          <span className="max-w-[120px] truncate">{deck.churchName?.trim() || "Marca"}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Nome da igreja
            </label>
            <Input
              value={deck.churchName ?? ""}
              onChange={(e) => onChange({ churchName: e.target.value || undefined })}
              placeholder="Ex.: Igreja Batista Central"
              className="h-10 bg-background"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Logo
            </label>
            <div className="flex items-center gap-2">
              {deck.logo && (
                <img
                  src={deck.logo}
                  alt="Logo da igreja"
                  className="size-12 rounded border border-border bg-[color:var(--color-surface)] object-contain p-1"
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <ImagePlus className="mr-1.5 size-4" />
                {deck.logo ? "Trocar" : "Enviar"}
              </Button>
              {deck.logo && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onChange({ logo: undefined })}
                  aria-label="Remover logo"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPickFile}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              PNG/SVG, fundo transparente, até ~500 KB.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            <Button type="button" size="sm" onClick={saveKit} className="flex-1">
              Salvar como marca
            </Button>
            {hasBrandKit() && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyKit}
                className="flex-1"
              >
                Aplicar marca salva
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            A marca aparece na capa e no encerramento. "Salvar" reaplica em novos decks.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
