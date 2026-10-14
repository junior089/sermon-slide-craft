import type { GenerationInput, SlideDeckResponse } from "@/lib/generation/schemas";

type ResponseSlide = SlideDeckResponse["slides"][number];

export function makeInput(overrides: Partial<GenerationInput> = {}): GenerationInput {
  return {
    theme: "A fé no meio do fogo",
    series: "Fornalha",
    preacher: "Pr. Exemplo",
    templateLocked: false,
    text: "Daniel 3 conta a história de três jovens que não se curvaram diante da estátua. A fé confia mesmo sem garantia de livramento.",
    style: "culto-principal",
    density: "equilibrado",
    displayMode: "telao",
    translation: "almeida",
    highlightVerses: true,
    generateOperatorNotes: true,
    suggestBlocks: false,
    ...overrides,
  };
}

export function makeSlide(overrides: Partial<ResponseSlide> = {}): ResponseSlide {
  return {
    id: "s",
    type: "topic",
    layout: "points",
    highlight: false,
    title: "Três respostas da fé",
    bullets: ["Confia antes de ver"],
    speakerNote: "Avançar com calma.",
    visualHint: "tópicos",
    ...overrides,
  };
}

export function makeDeck(overrides: Partial<SlideDeckResponse> = {}): SlideDeckResponse {
  return {
    title: "A fé no meio do fogo",
    summary: "Mensagem sobre fidelidade sob pressão.",
    estimatedDurationMinutes: 30,
    creativeDirection: undefined,
    motifs: [],
    mood: undefined,
    slides: [
      makeSlide({ id: "s-1", type: "title", layout: "cover", title: "A fé no meio do fogo" }),
      makeSlide({ id: "s-2" }),
      makeSlide({ id: "s-3", type: "conclusion", layout: "closing", title: "Vamos responder" }),
    ],
    ...overrides,
  };
}
