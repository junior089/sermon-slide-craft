import { describe, expect, it } from "vitest";

import { isGenericTitle, reviewSlide } from "@/components/editor/slide-review";
import type { Slide } from "@/types/slides";

function slide(overrides: Partial<Slide> = {}): Slide {
  return {
    id: "s-1",
    type: "topic",
    layout: "points",
    title: "A fé que não se curva",
    bullets: ["Confia antes de ver"],
    speakerNote: "Avançar após a leitura.",
    visualHint: "",
    ...overrides,
  };
}

describe("isGenericTitle", () => {
  it("reconhece títulos que serviriam para qualquer pregação", () => {
    expect(isGenericTitle("Aplicação prática")).toBe(true);
    expect(isGenericTitle("  Conclusão ")).toBe(true);
    expect(isGenericTitle("Ponto 2")).toBe(true);
  });

  it("aceita títulos específicos da mensagem", () => {
    expect(isGenericTitle("A fornalha não é o fim")).toBe(false);
    expect(isGenericTitle("")).toBe(false);
  });
});

describe("reviewSlide", () => {
  it("aprova um slide completo", () => {
    expect(reviewSlide(slide(), "telao")).toEqual([
      { type: "ok", text: "Slide pronto para revisão final." },
    ]);
  });

  it("aponta título genérico, excesso de tópicos e falta de nota", () => {
    const issues = reviewSlide(
      slide({ title: "Introdução", bullets: ["a", "b", "c", "d"], speakerNote: "" }),
      "telao",
    ).map((i) => i.text);

    expect(issues).toContain(
      "Título genérico: reescreva com o vocabulário específico desta mensagem.",
    );
    expect(issues).toContain("Este modo exibe até 3 tópicos; os demais ficam ocultos no slide.");
    expect(issues).toContain("Sem nota para o operador de mídia.");
  });

  it("aponta texto bíblico sem referência", () => {
    const issues = reviewSlide(
      slide({ layout: "scripture", verse: "O Senhor é o meu pastor." }),
      "telao",
    );
    expect(issues.map((i) => i.text)).toContain("Texto bíblico sem referência.");
  });
});
