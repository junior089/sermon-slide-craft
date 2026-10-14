import { describe, expect, it } from "vitest";

import { maxBulletCharsFor, maxBulletsFor, recommendTemplate } from "@/lib/slide-presets";

describe("recommendTemplate", () => {
  it("prioriza o estilo do culto sobre o tom", () => {
    expect(recommendTemplate("consolo", "estudo-biblico")).toBe("slate");
    expect(recommendTemplate("solene", "jovens")).toBe("mono");
    expect(recommendTemplate("celebracao", "conferencia")).toBe("horizon");
  });

  it("usa o tom no culto principal", () => {
    expect(recommendTemplate("consolo", "culto-principal")).toBe("aurora");
    expect(recommendTemplate("adoracao", "culto-principal")).toBe("worship");
    expect(recommendTemplate("ensino", "culto-principal")).toBe("scripture");
  });
});

describe("limites por modo de exibição", () => {
  it("é mais restrito no telão do que na impressão", () => {
    expect(maxBulletsFor("telao")).toBeLessThan(maxBulletsFor("impressao"));
    expect(maxBulletCharsFor("telao")).toBeLessThan(maxBulletCharsFor("impressao"));
  });
});
