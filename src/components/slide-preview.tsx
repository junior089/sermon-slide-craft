import { useEffect, useState } from "react";

import { DeckToolbar } from "@/components/editor/deck-toolbar";
import { SlideEditor } from "@/components/editor/slide-editor";
import { SlideList } from "@/components/editor/slide-list";
import { useDeckHistory } from "@/components/editor/use-deck-history";
import { PresentationMode } from "@/components/presentation-mode";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/use-auth";
import type { Slide, SlideDeck } from "@/types/slides";

interface Props {
  deck: SlideDeck;
  onChange: (deck: SlideDeck) => void;
}

export function SlidePreview({ deck, onChange }: Props) {
  const { user } = useAuth();
  const [selected, setSelected] = useState(0);
  const [presenting, setPresenting] = useState(false);
  const history = useDeckHistory(deck, onChange, user?.id ?? null);
  const { update } = history;

  function undo() {
    const prev = history.undo();
    if (prev) setSelected((s) => Math.min(s, prev.slides.length - 1));
  }

  function redo() {
    const next = history.redo();
    if (next) setSelected((s) => Math.min(s, next.slides.length - 1));
  }

  function reorder(from: number, to: number) {
    if (from === to || from < 0 || to < 0) return;
    const slides = [...deck.slides];
    const [moved] = slides.splice(from, 1);
    slides.splice(to, 0, moved);
    update({ ...deck, slides });
    setSelected(to);
  }

  function updateSlide(i: number, patch: Partial<Slide>) {
    const slides = deck.slides.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    update({ ...deck, slides });
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= deck.slides.length) return;
    const slides = [...deck.slides];
    [slides[i], slides[j]] = [slides[j], slides[i]];
    update({ ...deck, slides });
    setSelected(j);
  }

  function duplicate(i: number) {
    const s = deck.slides[i];
    const copy: Slide = { ...s, id: `${s.id}-copy-${Date.now()}` };
    const slides = [...deck.slides.slice(0, i + 1), copy, ...deck.slides.slice(i + 1)];
    update({ ...deck, slides });
    setSelected(i + 1);
  }

  function remove(i: number) {
    if (deck.slides.length <= 1) return;
    const slides = deck.slides.filter((_, idx) => idx !== i);
    update({ ...deck, slides });
    setSelected(Math.max(0, i - 1));
  }

  function addNew() {
    const slide: Slide = {
      id: `s-new-${Date.now()}`,
      type: "topic",
      layout: "points",
      highlight: false,
      title: "Novo slide",
      bullets: [],
      speakerNote: "",
      visualHint: "",
    };
    const slides = [...deck.slides, slide];
    update({ ...deck, slides });
    setSelected(slides.length - 1);
  }

  useEffect(() => {
    if (selected > deck.slides.length - 1) setSelected(Math.max(0, deck.slides.length - 1));
  }, [deck.slides.length, selected]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true'], button, [role='combobox']")) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSelected((current) => Math.max(0, current - 1));
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setSelected((current) => Math.min(deck.slides.length - 1, current + 1));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // undo e redo são recriados a cada render, mas só mudam de efeito quando o deck muda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck]);

  const index = Math.min(selected, deck.slides.length - 1);

  return (
    <>
      <Card className="preview-workbench overflow-hidden rounded-lg border-border bg-card p-0 shadow-none">
        <DeckToolbar
          deck={deck}
          onUpdate={update}
          onUndo={undo}
          onRedo={redo}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          onPresent={() => setPresenting(true)}
        />

        <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
          <SlideList
            deck={deck}
            selected={index}
            onSelect={setSelected}
            onReorder={reorder}
            onAdd={addNew}
          />
          <SlideEditor
            deck={deck}
            index={index}
            onUpdateSlide={(patch) => updateSlide(index, patch)}
            onMove={(dir) => move(index, dir)}
            onDuplicate={() => duplicate(index)}
            onRemove={() => remove(index)}
          />
        </div>
      </Card>

      {presenting && (
        <PresentationMode deck={deck} startIndex={index} onClose={() => setPresenting(false)} />
      )}
    </>
  );
}
