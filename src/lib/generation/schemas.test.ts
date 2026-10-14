import { describe, expect, it } from "vitest";

import { generationSettingsSchema, slideDeckResponseSchema } from "@/lib/generation/schemas";
import { makeDeck, makeInput, makeSlide } from "@/test/fixtures";

describe("slideDeckResponseSchema", () => {
  it("aceita um deck válido", () => {
    const result = slideDeckResponseSchema.safeParse(makeDeck());
    expect(result.success).toBe(true);
  });

  it("rejeita deck com menos de 3 slides", () => {
    const deck = makeDeck({ slides: [makeSlide(), makeSlide()] });
    expect(slideDeckResponseSchema.safeParse(deck).success).toBe(false);
  });

  it("rejeita deck sem título", () => {
    expect(slideDeckResponseSchema.safeParse(makeDeck({ title: "" })).success).toBe(false);
  });

  it("rejeita slide com tipo desconhecido", () => {
    const deck = makeDeck();
    const invalid = { ...deck, slides: [...deck.slides, { ...makeSlide(), type: "video" }] };
    expect(slideDeckResponseSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejeita duração fora do intervalo", () => {
    const deck = makeDeck({ estimatedDurationMinutes: 0 });
    expect(slideDeckResponseSchema.safeParse(deck).success).toBe(false);
  });

  it("descarta layout desconhecido em vez de invalidar o deck", () => {
    const deck = makeDeck();
    const input = { ...deck, slides: [{ ...deck.slides[0], layout: "carrossel" }, ...deck.slides] };
    const parsed = slideDeckResponseSchema.parse(input);
    expect(parsed.slides[0].layout).toBeUndefined();
  });

  it("aceita textos opcionais vazios e preenche padrões", () => {
    const raw = {
      ...makeDeck(),
      slides: [
        { id: "a", type: "verse", title: "Salmos 23:1", subtitle: "", verse: "", reference: "" },
        { id: "b", type: "topic", title: "Tópico" },
        { id: "c", type: "conclusion", title: "Fim" },
      ],
    };
    const parsed = slideDeckResponseSchema.parse(raw);
    expect(parsed.slides[0].subtitle ?? "").toBe("");
    expect(parsed.slides[0].verse ?? "").toBe("");
    expect(parsed.slides[1].bullets).toEqual([]);
    expect(parsed.slides[1].highlight).toBe(false);
    expect(parsed.slides[1].speakerNote).toBe("");
  });

  it("usa o template padrão quando a recomendação é inválida", () => {
    const deck = makeDeck({
      creativeDirection: {
        centralTheme: "Fé",
        sermonThesis: "",
        sermonMovement: "ensino",
        emotionalArc: [],
        pastoralTone: "",
        visualRationale: "",
        // @ts-expect-error valor fora do enum, como o modelo às vezes devolve
        recommendedTemplate: "neon",
        recommendedMood: "ensino",
        recommendedMotifs: [],
        avoidVisuals: [],
      },
    });
    const parsed = slideDeckResponseSchema.parse(deck);
    expect(parsed.creativeDirection?.recommendedTemplate).toBe("cinematic");
  });
});

describe("generationSettingsSchema", () => {
  it("exige roteiro com pelo menos 40 caracteres", () => {
    const result = generationSettingsSchema.safeParse(makeInput({ text: "curto" }));
    expect(result.success).toBe(false);
  });

  it("usa Almeida quando a tradução é inválida", () => {
    const parsed = generationSettingsSchema.parse({ ...makeInput(), translation: "kjv" });
    expect(parsed.translation).toBe("almeida");
  });
});
