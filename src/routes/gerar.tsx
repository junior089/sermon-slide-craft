import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Wand2 } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { GeneratorForm } from "@/components/generator-form";
import { GeneratingPreview } from "@/components/generating-preview";
import { SlidePreview } from "@/components/slide-preview";
import { DeckSnapshot } from "@/components/workspace/deck-snapshot";
import { EmptyPreview } from "@/components/workspace/empty-preview";
import { FlowRail } from "@/components/workspace/flow-rail";
import { RecentDecks } from "@/components/workspace/recent-decks";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { listDecks, removeDeck } from "@/lib/storage/deck-repository";
import { useAuth } from "@/lib/auth/use-auth";
import type { SlideDeck } from "@/types/slides";

export const Route = createFileRoute("/gerar")({
  head: () => ({
    meta: [
      { title: "Gerar slides — Visio Divina" },
      {
        name: "description",
        content: "Cole o roteiro da pregação e gere uma apresentação editável.",
      },
      { property: "og:title", content: "Gerar slides — Visio Divina" },
      {
        property: "og:description",
        content: "Cole o roteiro da pregação e gere uma apresentação editável.",
      },
    ],
  }),
  component: GerarPage,
});

function GerarPage() {
  const { user, loading } = useAuth();
  const userId = user?.id ?? null;
  const [deck, setDeck] = useState<SlideDeck | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [history, setHistory] = useState<SlideDeck[]>([]);
  const [generating, setGenerating] = useState(false);
  const [genEstimate, setGenEstimate] = useState<number | undefined>(undefined);
  const deckId = deck?.id;

  function updateOpenDeck(next: SlideDeck) {
    setDeck(next);
    setHistory((decks) => decks.map((item) => (item.id === next.id ? next : item)));
  }

  useEffect(() => {
    if (loading) return;
    let active = true;
    listDecks(userId).then((decks) => {
      if (active) setHistory(decks);
    });
    return () => {
      active = false;
    };
  }, [deckId, userId, loading]);

  return (
    <AppShell>
      <div className="gerar-workspace">
        <div className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
          <header className="mb-8 flex flex-col gap-5">
            <div className="gerar-hero">
              <div className="min-w-0">
                <span className="u-eyebrow text-white/65">Editor de culto</span>
                <h1 className="u-display mt-4 max-w-4xl text-5xl text-white sm:text-6xl md:text-7xl">
                  Preparar apresentação
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                  Gere, ajuste e entregue uma sequência visual pronta para a equipe de mídia.
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDeck(null);
                    setWarning(null);
                  }}
                  className="rounded-full border-white/50 bg-white px-5 text-primary hover:bg-white/90"
                >
                  <Wand2 className="mr-1.5 size-4" /> Novo roteiro
                </Button>
                <span className="text-xs text-white/60">
                  {deck ? "Deck em revisão" : "Sem deck aberto"}
                </span>
              </div>
            </div>
            <FlowRail hasDeck={!!deck} />
            {deck && <DeckSnapshot deck={deck} />}
          </header>

          {warning && (
            <Alert className="mb-5 border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/10">
              <AlertDescription className="text-foreground">{warning}</AlertDescription>
            </Alert>
          )}

          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(360px,430px)_minmax(0,1fr)]">
            <div className="min-w-0 flex flex-col gap-4 xl:sticky xl:top-24 xl:self-start">
              <GeneratorForm
                onGenerated={(d, w) => {
                  setDeck(d);
                  setWarning(w ?? null);
                }}
                onGeneratingChange={(active, meta) => {
                  setGenerating(active);
                  if (active) setGenEstimate(meta?.estimate);
                }}
              />
              {history.length > 0 && (
                <RecentDecks
                  decks={history}
                  onSelect={(selectedDeck) => {
                    setDeck(selectedDeck);
                    setWarning(null);
                  }}
                  onRemove={(id) => {
                    removeDeck(id, userId).then(() => listDecks(userId).then(setHistory));
                    if (deck?.id === id) setDeck(null);
                  }}
                />
              )}
            </div>
            <div className="min-w-0">
              {generating ? (
                <GeneratingPreview estimate={genEstimate} />
              ) : deck ? (
                <SlidePreview deck={deck} onChange={updateOpenDeck} />
              ) : (
                <EmptyPreview />
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
