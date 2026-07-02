import type { GenerationSettings } from "@/types/slides";

export const EXAMPLE_SCRIPT = `Tema: Batalha da mente

1. O que são pensamentos?
Ciência
Pensamentos são processos elétricos e químicos do cérebro. Envolvem dopamina, serotonina e cortisol. Pensar gera impacto físico, emocional e comportamental.
Bíblia
Provérbios 23:7; Romanos 12:2; 2 Coríntios 10:5
Chave: Pensamentos definem quem você se torna.

2. Como os pensamentos chegam?
Ciência
Eles chegam por memórias, imaginação, estímulos externos e padrões automáticos.
Bíblia
Gálatas 5:17; Romanos 12:2; João 8:44
Chave: Nem todo pensamento vem de você.

3. Capturar e substituir pensamentos
Ciência
A repetição fortalece conexões neurais. O que se repete vira padrão.
Bíblia
2 Coríntios 10:5; Filipenses 4:8
Chave: Não basta tirar; precisa substituir.

Conclusão
Pensamentos são biológicos e espirituais. Precisam ser vigiados, filtrados e substituídos.
Frase final: A mente é o campo de batalha, e a vitória começa no pensamento.`;

export const EXAMPLE_THEME = "Batalha da mente";

export const DEFAULT_SETTINGS: GenerationSettings = {
  style: "culto-principal",
  density: "equilibrado",
  displayMode: "telao",
  translation: "almeida",
  highlightVerses: true,
  generateOperatorNotes: true,
  suggestBlocks: false,
};

export const STYLE_PRESETS: {
  label: string;
  hint: string;
  patch: Pick<GenerationSettings, "style" | "density" | "displayMode">;
}[] = [
  {
    label: "Culto",
    hint: "telão enxuto",
    patch: { style: "culto-principal", density: "equilibrado", displayMode: "telao" },
  },
  {
    label: "Estudo",
    hint: "mais conteúdo",
    patch: { style: "estudo-biblico", density: "detalhado", displayMode: "impressao" },
  },
  {
    label: "Jovens",
    hint: "direto e forte",
    patch: { style: "jovens", density: "direto", displayMode: "telao" },
  },
  {
    label: "Conferência",
    hint: "ritmo de sessão",
    patch: { style: "conferencia", density: "equilibrado", displayMode: "tela" },
  },
];
