import { describe, expect, it } from "vitest";

import { extractScriptureReferences } from "@/lib/bible/scripture";

describe("extractScriptureReferences", () => {
  it("encontra referência com dois-pontos", () => {
    expect(extractScriptureReferences("Leia Romanos 8:28 em casa.")).toEqual(["Romanos 8:28"]);
  });

  it("normaliza o ponto como separador de versículo", () => {
    expect(extractScriptureReferences("Texto base: Daniel 3.17")).toEqual(["Daniel 3:17"]);
  });

  it("aceita intervalos com hífen e com travessão", () => {
    expect(extractScriptureReferences("João 3:16-17 e Salmos 23:1–3")).toEqual([
      "João 3:16-17",
      "Salmos 23:1-3",
    ]);
  });

  it("mantém o ordinal do livro", () => {
    expect(extractScriptureReferences("1 Coríntios 13:4-7; II Reis 2:11")).toEqual([
      "1 Coríntios 13:4-7",
      "II Reis 2:11",
    ]);
  });

  it("reconhece abreviações comuns", () => {
    expect(extractScriptureReferences("Sl 23:1, Fp 4:13 e Mt. 5:3")).toEqual([
      "Sl 23:1",
      "Fp 4:13",
      "Mt 5:3",
    ]);
  });

  it("ignora horários e números que não são referências bíblicas", () => {
    expect(extractScriptureReferences("Encontro na Sala 3:00, culto às 19:30.")).toEqual([]);
  });

  it("ignora referências sem versículo", () => {
    expect(extractScriptureReferences("Vamos estudar Daniel 3 inteiro.")).toEqual([]);
  });

  it("remove duplicatas, inclusive com e sem acento", () => {
    expect(extractScriptureReferences("João 3:16, joao 3:16 e João 3.16")).toEqual(["João 3:16"]);
  });

  it("respeita o limite de referências", () => {
    const text = "Gn 1:1, Ex 2:2, Lv 3:3, Nm 4:4";
    expect(extractScriptureReferences(text, 2)).toEqual(["Gn 1:1", "Ex 2:2"]);
  });
});
