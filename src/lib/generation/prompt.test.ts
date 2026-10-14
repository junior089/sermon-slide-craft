import { describe, expect, it } from "vitest";

import { buildJsonRepairPrompt, buildSlidesPrompt, extractJson } from "@/lib/generation/prompt";
import { makeInput } from "@/test/fixtures";

describe("extractJson", () => {
  it("lê JSON puro", () => {
    expect(extractJson('{"title":"Mensagem"}')).toEqual({ title: "Mensagem" });
  });

  it("ignora espaços em volta", () => {
    expect(extractJson('\n  {"a":1}  \n')).toEqual({ a: 1 });
  });

  it("extrai o JSON de um bloco de código markdown", () => {
    const raw = 'Aqui está:\n```json\n{"slides":[1,2]}\n```\nEspero que ajude.';
    expect(extractJson(raw)).toEqual({ slides: [1, 2] });
  });

  it("aceita bloco de código sem a indicação de linguagem", () => {
    expect(extractJson('```\n{"ok":true}\n```')).toEqual({ ok: true });
  });

  it("extrai o objeto do meio de um texto livre", () => {
    const raw = 'Segue a apresentação: {"title":"Fé","nested":{"x":1}} Fim.';
    expect(extractJson(raw)).toEqual({ title: "Fé", nested: { x: 1 } });
  });

  it("lança erro quando não há JSON recuperável", () => {
    expect(() => extractJson("Não consegui gerar os slides.")).toThrow(/JSON válido/);
    expect(() => extractJson('{"title": "sem fechar"')).toThrow();
  });
});

describe("buildJsonRepairPrompt", () => {
  it("inclui o erro de validação e a resposta original", () => {
    const prompt = buildJsonRepairPrompt('  {"title": 1}  ', "title: Expected string");
    expect(prompt.user).toContain("title: Expected string");
    expect(prompt.user).toContain('{"title": 1}');
    expect(prompt.system).toContain("Retorne APENAS JSON válido");
  });

  it("usa uma mensagem padrão quando não há erro de validação", () => {
    const prompt = buildJsonRepairPrompt("texto qualquer");
    expect(prompt.user).toContain("não pôde ser interpretada como JSON válido");
  });
});

describe("buildSlidesPrompt", () => {
  it("inclui o roteiro e os textos bíblicos resolvidos", () => {
    const input = makeInput({ text: "Roteiro sobre Daniel 3:17 e a fé que não se curva." });
    const { system, user } = buildSlidesPrompt(input, [
      { reference: "Daniel 3:17", text: "O nosso Deus pode nos livrar." },
    ]);
    expect(system.length).toBeGreaterThan(0);
    expect(user).toContain("Roteiro sobre Daniel 3:17");
    expect(user).toContain("O nosso Deus pode nos livrar.");
  });
});
