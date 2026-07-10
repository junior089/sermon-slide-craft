import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { listDecks } from "@/lib/storage/deck-repository";
import { useAuth } from "@/lib/auth/use-auth";
import type { SlideDeck } from "@/types/slides";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visio Divina — Painel" },
      {
        name: "description",
        content:
          "Apresentações recentes e atalho para criar uma nova a partir do roteiro da pregação.",
      },
      { property: "og:title", content: "Visio Divina — Painel" },
      {
        property: "og:description",
        content:
          "Gera apresentações de pregações a partir do roteiro, com editor e exportação para PPTX, PDF e PNG.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { user, loading } = useAuth();
  const [history, setHistory] = useState<SlideDeck[]>([]);

  useEffect(() => {
    if (loading) return;
    let active = true;
    listDecks(user?.id ?? null).then((decks) => {
      if (active) setHistory(decks);
    });
    return () => {
      active = false;
    };
  }, [user, loading]);

  const latest = history[0];
  const totalSlides = history.reduce((sum, deck) => sum + deck.slides.length, 0);

  return (
    <AppShell>
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="min-w-0">
            <span className="u-eyebrow">Painel</span>
            <h1 className="t-hero mt-6 max-w-[12ch]">Slides do culto</h1>
            <p className="t-body-lg mt-7 max-w-[52ch] text-muted-foreground">
              Comece um roteiro novo ou retome uma apresentação salva na sua conta.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/gerar" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
                <Plus className="size-4" /> Novo deck
              </Link>
              <Link
                to="/gerar"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full sm:w-auto",
                )}
              >
                Abrir editor <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <dl className="grid gap-5 rounded-lg bg-[color:var(--color-surface)] p-6 text-sm">
            <Status label="Decks salvos" value={history.length} />
            <Status label="Slides no histórico" value={totalSlides} />
            <Status
              label="Última edição"
              value={latest ? formatDate(latest.createdAt) : "Nenhuma"}
            />
          </dl>
        </div>

        <div>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-8">
            <div>
              <span className="u-eyebrow">Histórico</span>
              <h2 className="t-section mt-3">Apresentações recentes</h2>
            </div>
            <Link
              to="/gerar"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              Editor <ArrowRight className="size-4" />
            </Link>
          </div>

          {history.length > 0 ? (
            <div className="divide-y divide-border border-y border-border">
              {history.slice(0, 8).map((deck) => (
                <RecentDeck key={deck.id} deck={deck} />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 rounded-lg bg-[color:var(--color-surface)] p-8 text-muted-foreground sm:grid-cols-[auto_1fr] sm:items-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-background text-foreground">
                <FileText className="size-5 shrink-0" />
              </span>
              <p className="text-sm">Nenhuma apresentação salva ainda.</p>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function Status({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="u-eyebrow !text-[0.68rem]">{label}</dt>
      <dd className="u-display mt-2 text-3xl">{value}</dd>
    </div>
  );
}

function RecentDeck({ deck }: { deck: SlideDeck }) {
  return (
    <Link
      to="/gerar"
      className="grid gap-2 py-5 transition-colors hover:bg-[color:var(--color-surface-alt)] md:grid-cols-[1fr_120px_120px] md:px-3"
    >
      <div className="min-w-0">
        <h3 className="line-clamp-1 text-lg font-normal text-foreground">{deck.title}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
          {deck.summary || "Sem resumo salvo."}
        </p>
      </div>
      <span className="text-sm text-muted-foreground md:text-right">
        {deck.slides.length} slides
      </span>
      <span className="text-sm text-muted-foreground md:text-right">
        {formatDate(deck.createdAt)}
      </span>
    </Link>
  );
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(value);
}
