import { describe, expect, it } from "vitest";

import { buildDeckFromResult, computeFormMetrics } from "@/components/generator/build-deck";
import { DEFAULT_SETTINGS } from "@/components/generator/presets";
import type { GenerateSlidesResult } from "@/lib/generation/generate-slides";
import { makeDeck } from "@/test/fixtures";

const FIELDS = { theme: "A fé no fogo", series: " Fornalha ", preacher: "" };

function result(recommended?: "aurora"): GenerateSlidesResult {
  const deck = makeDeck();
  return {
    source: "demo",
    deck: recommended
      ? {
          ...deck,
          creativeDirection: {
            centralTheme: "Fé",
            sermonThesis: "",
            sermonMovement: "ensino",
            emotionalArc: [],
            pastoralTone: "",
            visualRationale: "",
            recommendedTemplate: recommended,
            recommendedMood: "consolo",
            recommendedMotifs: [],
            avoidVisuals: [],
          },
        }
      : deck,
    trace: {
      provider: "demo",
      model: "demo-generator",
      generatedAt: 0,
      usedRecommendedTemplate: false,
      selectedTemplate: "cinematic",
      prompt: { system: "", user: "" },
      rawResponse: "",
      notes: [],
    },
  };
}

describe("computeFormMetrics", () => {
  it("zera a sugestão de slides sem roteiro", () => {
    const metrics = computeFormMetrics({ ...FIELDS, text: "" }, DEFAULT_SETTINGS);
    expect(metrics.words).toBe(0);
    expect(metrics.suggestedSlides).toBe(0);
  });

  it("sugere mais slides no modo detalhado", () => {
    const text = "palavra ".repeat(600);
    const balanced = computeFormMetrics({ ...FIELDS, text }, DEFAULT_SETTINGS);
    const detailed = computeFormMetrics(
      { ...FIELDS, text },
      { ...DEFAULT_SETTINGS, density: "detalhado" },
    );
    expect(detailed.suggestedSlides).toBeGreaterThan(balanced.suggestedSlides);
  });
});

describe("buildDeckFromResult", () => {
  it("aplica o template recomendado quando o usuário não escolheu um", () => {
    const deck = buildDeckFromResult({
      result: result("aurora"),
      fields: FIELDS,
      settings: DEFAULT_SETTINGS,
      template: "cinematic",
      templateLocked: false,
      brandKit: {},
      now: 1,
    });
    expect(deck.template).toBe("aurora");
    expect(deck.aiTrace?.usedRecommendedTemplate).toBe(true);
    expect(deck.series).toBe("Fornalha");
    expect(deck.preacher).toBeUndefined();
    expect(deck.id).toBe("deck-1");
  });

  it("mantém o template escolhido pelo usuário", () => {
    const deck = buildDeckFromResult({
      result: result("aurora"),
      fields: FIELDS,
      settings: DEFAULT_SETTINGS,
      template: "mono",
      templateLocked: true,
      brandKit: { churchName: "Igreja Central" },
    });
    expect(deck.template).toBe("mono");
    expect(deck.aiTrace?.usedRecommendedTemplate).toBe(false);
    expect(deck.churchName).toBe("Igreja Central");
  });
});
