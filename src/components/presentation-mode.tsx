import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  LayoutGrid,
  Maximize,
  Minimize,
  X,
} from "lucide-react";

import { SlideCanvas } from "@/components/slide-canvas";
import { getTypeLabel } from "@/lib/export/files";
import type { SlideDeck } from "@/types/slides";
import { cn } from "@/lib/utils";

interface Props {
  deck: SlideDeck;
  startIndex?: number;
  onClose: () => void;
}

type Blank = "none" | "black" | "white";

export function PresentationMode({ deck, startIndex = 0, onClose }: Props) {
  const [idx, setIdx] = useState(startIndex);
  const [blank, setBlank] = useState<Blank>("none");
  const [showNotes, setShowNotes] = useState(false);
  const [overview, setOverview] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const total = deck.slides.length;

  const toggleFs = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await rootRef.current?.requestFullscreen?.();
    } catch {
      // O navegador pode bloquear a tela cheia (iframe ou política); segue em janela.
    }
  }, []);

  useEffect(() => {
    rootRef.current?.requestFullscreen?.().catch(() => {});
    const onFsChange = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.body.style.overflow = "";
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      if (e.key === "Escape") {
        if (overview) setOverview(false);
        else if (blank !== "none") setBlank("none");
        else onClose();
        return;
      }
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        setIdx((i) => Math.min(total - 1, i + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Home") {
        setIdx(0);
      } else if (e.key === "End") {
        setIdx(total - 1);
      } else if (k === "b") {
        setBlank((b) => (b === "black" ? "none" : "black"));
      } else if (k === "w") {
        setBlank((b) => (b === "white" ? "none" : "white"));
      } else if (k === "n") {
        setShowNotes((s) => !s);
      } else if (k === "g") {
        setOverview((o) => !o);
      } else if (k === "f") {
        void toggleFs();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [blank, overview, total, toggleFs, onClose]);

  const slide = deck.slides[idx];
  if (!slide) return null;

  const canvasProps = {
    template: deck.template,
    displayMode: deck.displayMode,
    total,
    series: deck.series,
    preacher: deck.preacher,
    messageTitle: deck.title,
    deckMotif: deck.motifs?.[0],
    deckMood: deck.mood,
    accentColor: deck.accentColor,
    churchName: deck.churchName,
    logo: deck.logo,
    showChrome: false,
  } as const;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
    >
      <div className="absolute right-4 top-4 z-40 flex items-center gap-2">
        <span className="mr-1 text-sm font-medium text-white/70">
          {idx + 1} / {total}
        </span>
        <ToolBtn
          label="Notas do operador (N)"
          active={showNotes}
          onClick={() => setShowNotes((s) => !s)}
        >
          {showNotes ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </ToolBtn>
        <ToolBtn label="Visão geral (G)" active={overview} onClick={() => setOverview((o) => !o)}>
          <LayoutGrid className="size-4" />
        </ToolBtn>
        <ToolBtn label="Tela cheia (F)" active={isFs} onClick={() => void toggleFs()}>
          {isFs ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
        </ToolBtn>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10"
          aria-label="Sair da apresentação"
        >
          <X className="size-4" /> Sair (ESC)
        </button>
      </div>

      <div className="flex flex-col" style={{ width: "min(96vw, calc(96vh * 16 / 9))" }}>
        <SlideCanvas slide={slide} index={idx} {...canvasProps} />
        {showNotes && (
          <div className="mt-4 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
            <span className="mr-2 text-white/40">Nota do operador:</span>
            {slide.speakerNote || "—"}
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-6 z-40 flex items-center justify-center gap-2">
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronLeft className="size-4" /> Anterior
        </button>
        <button
          onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
          disabled={idx === total - 1}
          className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10 disabled:opacity-30"
        >
          Próximo <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-4 z-40 hidden text-xs text-white/30 sm:block">
        B tela preta · W tela branca · N notas · G visão geral · F tela cheia
      </div>

      {blank !== "none" && (
        <button
          onClick={() => setBlank("none")}
          aria-label="Voltar à apresentação"
          className={cn(
            "absolute inset-0 z-[60] cursor-pointer",
            blank === "black" ? "bg-black" : "bg-white",
          )}
        />
      )}

      {overview && (
        <div className="absolute inset-0 z-[70] overflow-auto bg-black/95 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm uppercase tracking-[0.18em] text-white/60">Visão geral</span>
            <button
              onClick={() => setOverview(false)}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10"
            >
              <X className="size-4" /> Fechar (ESC)
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {deck.slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  setIdx(i);
                  setOverview(false);
                }}
                className={cn(
                  "flex flex-col gap-1 rounded-lg border p-1 text-left transition-colors",
                  i === idx
                    ? "border-white ring-1 ring-white"
                    : "border-white/15 hover:border-white/50",
                )}
              >
                <SlideCanvas slide={s} index={i} {...canvasProps} className="slide-thumb-canvas" />
                <div className="flex items-center justify-between px-1 pb-0.5 text-[10px] uppercase tracking-[0.14em] text-white/50">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span>{getTypeLabel(s.type)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ToolBtn({
  children,
  label,
  active,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md border text-white/90 transition-colors",
        active ? "border-white/60 bg-white/15" : "border-white/15 bg-white/5 hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}
