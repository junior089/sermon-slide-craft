import { describe, expect, it } from "vitest";

import { generateDemoDeck } from "@/lib/generation/demo-generator";
import { normalizeAiDeck } from "@/lib/generation/normalizer";
import { slideDeckResponseSchema, type GenerationInput } from "@/lib/generation/schemas";
import { maxBulletsFor } from "@/lib/slide-presets";
import { makeInput } from "@/test/fixtures";

const SCRIPT = `Tema: A fé no meio do fogo

Daniel 3:17 mostra três jovens diante da fornalha. Eles não se curvaram à estátua.
A fé confia antes de ver o livramento. Deus está presente no fogo.
Aplicação: permanecer fiel quando a pressão aumenta. Testemunhar com clareza.`;

const VARIATIONS: Partial<GenerationInput>[] = [
  {},
  { displayMode: "tela", density: "direto" },
  { displayMode: "impressao", density: "detalhado", style: "estudo-biblico" },
  { style: "jovens", highlightVerses: false, generateOperatorNotes: false },
  { style: "conferencia", displayMode: "tela" },
];

describe("generateDemoDeck", () => {
  it.each(VARIATIONS)("produz um deck válido pelo schema (%o)", (overrides) => {
    const input = makeInput({ text: SCRIPT, ...overrides });
    const deck = generateDemoDeck(input);
    expect(slideDeckResponseSchema.safeParse(deck).success).toBe(true);
  });

  it("começa com capa e termina com encerramento", () => {
    const deck = generateDemoDeck(makeInput({ text: SCRIPT }));
    expect(deck.slides[0]).toMatchObject({ type: "title", layout: "cover" });
    expect(deck.slides.at(-1)).toMatchObject({ type: "conclusion", layout: "closing" });
  });

  it("cria slide de versículo quando o roteiro cita uma referência", () => {
    const deck = generateDemoDeck(makeInput({ text: SCRIPT, highlightVerses: true }));
    expect(deck.slides.some((s) => s.layout === "scripture")).toBe(true);
  });

  it("respeita o limite de tópicos do modo de exibição", () => {
    const input = makeInput({ text: SCRIPT, displayMode: "telao" });
    const deck = generateDemoDeck(input);
    const max = maxBulletsFor("telao");
    expect(deck.slides.every((s) => s.bullets.length <= max)).toBe(true);
  });

  it("continua válido depois da normalização", () => {
    const input = makeInput({ text: SCRIPT });
    const normalized = normalizeAiDeck(generateDemoDeck(input), input);
    expect(slideDeckResponseSchema.safeParse(normalized).success).toBe(true);
  });
});
