import { describe, expect, it } from "vitest";

import { normalizeAiDeck } from "@/lib/generation/normalizer";
import { slideDeckResponseSchema } from "@/lib/generation/schemas";
import { maxBulletCharsFor, maxBulletsFor } from "@/lib/slide-presets";
import { makeDeck, makeInput, makeSlide } from "@/test/fixtures";

const LONG_VERSE = Array.from(
  { length: 40 },
  (_, i) => `palavra${i} da passagem que continua por várias linhas`,
).join(" ");

describe("normalizeAiDeck", () => {
  it("insere capa e encerramento quando o modelo não os envia", () => {
    const deck = makeDeck({
      slides: [makeSlide({ id: "a" }), makeSlide({ id: "b" }), makeSlide({ id: "c" })],
    });
    const result = normalizeAiDeck(deck, makeInput());

    expect(result.slides[0]).toMatchObject({ type: "title", layout: "cover" });
    expect(result.slides.at(-1)).toMatchObject({ type: "conclusion", layout: "closing" });
    expect(result.slides).toHaveLength(5);
  });

  it("converte capas e encerramentos no meio do deck em slides comuns", () => {
    const deck = makeDeck({
      slides: [
        makeSlide({ id: "a", type: "title", layout: "cover", title: "Abertura" }),
        makeSlide({ id: "b", type: "title", layout: "cover", title: "Segunda capa" }),
        makeSlide({ id: "c", type: "conclusion", layout: "closing", title: "Fim" }),
      ],
    });
    const result = normalizeAiDeck(deck, makeInput());
    expect(result.slides[1]).toMatchObject({ type: "topic", layout: "points" });
  });

  it("converte textos opcionais vazios em undefined", () => {
    const deck = makeDeck();
    deck.slides[1] = makeSlide({ subtitle: "  ", reference: "" });
    const result = normalizeAiDeck(deck, makeInput());
    expect(result.slides[1].subtitle).toBeUndefined();
    expect(result.slides[1].reference).toBeUndefined();
  });

  it("renumera os ids em sequência", () => {
    const result = normalizeAiDeck(makeDeck(), makeInput());
    expect(result.slides.map((s) => s.id)).toEqual(result.slides.map((_, i) => `s-${i + 1}`));
  });

  it("pagina tópicos acima do limite do modo de exibição", () => {
    const bullets = ["Um", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete"];
    const deck = makeDeck();
    deck.slides[1] = makeSlide({ id: "pts", title: "Sete passos", bullets });
    const result = normalizeAiDeck(deck, makeInput({ displayMode: "telao" }));

    const pages = result.slides.filter((s) => s.title === "Sete passos");
    const max = maxBulletsFor("telao");
    expect(pages).toHaveLength(Math.ceil(bullets.length / max));
    expect(pages.every((p) => p.bullets.length <= max)).toBe(true);
    expect(pages.flatMap((p) => p.bullets)).toEqual(bullets);
  });

  it("quebra tópicos longos no limite de caracteres do modo", () => {
    const deck = makeDeck();
    deck.slides[1] = makeSlide({
      bullets: ["Uma frase bastante longa que não cabe numa única linha do telão da igreja"],
    });
    const result = normalizeAiDeck(deck, makeInput({ displayMode: "telao" }));
    const limit = maxBulletCharsFor("telao");
    const bullets = result.slides.flatMap((s) => s.bullets);
    expect(bullets.length).toBeGreaterThan(1);
    expect(bullets.every((b) => b.length <= limit)).toBe(true);
  });

  it("pagina texto bíblico longo em vários slides", () => {
    const deck = makeDeck();
    deck.slides[1] = makeSlide({
      type: "verse",
      layout: "scripture",
      title: "Salmos 119",
      reference: "Salmos 119:1-8",
      bullets: [],
      verse: LONG_VERSE,
    });
    const result = normalizeAiDeck(deck, makeInput());
    const scripture = result.slides.filter((s) => s.layout === "scripture");

    expect(scripture.length).toBeGreaterThan(1);
    expect(scripture.every((s) => (s.verse ?? "").length <= 360)).toBe(true);
    expect(scripture.every((s) => s.title === "Salmos 119:1-8")).toBe(true);
  });

  it("remove tópicos de layouts que não os exibem", () => {
    const deck = makeDeck();
    deck.slides[1] = makeSlide({ layout: "statement", type: "reflection", bullets: ["sobra"] });
    const result = normalizeAiDeck(deck, makeInput());
    expect(result.slides[1].bullets).toEqual([]);
  });

  it("descarta mood e motivos fora do vocabulário", () => {
    const deck = makeDeck({ motifs: ["fogo", "dragao"], mood: "euforia" });
    deck.slides[1] = makeSlide({ motif: "unicornio", mood: "nostalgia" });
    const result = normalizeAiDeck(deck, makeInput());

    expect(result.motifs).toEqual(["fogo"]);
    expect(result.slides[1].motif).toBeUndefined();
    expect(result.slides[1].mood).toBeUndefined();
    expect(result.mood === undefined || typeof result.mood === "string").toBe(true);
  });

  it("mantém mood e motivos válidos", () => {
    const deck = makeDeck({ motifs: ["mar", "barco", "ondas"], mood: "consolo" });
    deck.slides[1] = makeSlide({ motif: "cruz", mood: "adoracao" });
    const result = normalizeAiDeck(deck, makeInput());

    expect(result.motifs).toEqual(["mar", "ondas"]);
    expect(result.mood).toBe("consolo");
    expect(result.slides[1].motif).toBe("cruz");
    expect(result.slides[1].mood).toBe("adoracao");
  });

  it("garante ao menos um destaque", () => {
    const deck = makeDeck();
    deck.slides = deck.slides.map((s) => ({ ...s, highlight: false }));
    const result = normalizeAiDeck(deck, makeInput());
    expect(result.slides.some((s) => s.highlight)).toBe(true);
  });

  it("devolve um deck que continua válido pelo schema", () => {
    const result = normalizeAiDeck(makeDeck(), makeInput());
    expect(slideDeckResponseSchema.safeParse(result).success).toBe(true);
  });
});
