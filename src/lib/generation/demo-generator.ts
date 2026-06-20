import type { SlideDeckResponse } from "@/lib/generation/schemas";
import type { GenerationInput } from "@/lib/generation/schemas";
import { maxBulletsFor, recommendTemplate } from "@/lib/slide-presets";
import { detectMotifs } from "@/lib/generation/motifs";
import { detectMood, type MoodKey } from "@/lib/generation/moods";

// Usado sem chave de API e como fallback quando a geração falha. Não chama
// o modelo e produz um deck no mesmo formato que ele.
export function generateDemoDeck(input: GenerationInput): SlideDeckResponse {
  const text = input.text.trim();
  const maxBullets = maxBulletsFor(input.displayMode);
  const sentences = text
    .split(/\n+|(?<=[.!?])\s+/)
    .flatMap((s) => splitLongText(s.trim(), input.displayMode === "telao" ? 90 : 160))
    .filter((s) => s.length > 0);

  const title =
    input.theme?.trim() ||
    sentences[0]?.replace(/^t[íi]tulo:\s*/i, "").slice(0, 80) ||
    "Mensagem de fé";
  const motifs = detectMotifs(`${input.theme ?? ""} ${text}`);
  const mood: MoodKey = detectMood(`${input.theme ?? ""} ${text}`) ?? "ensino";
  const recommendedTemplate = recommendTemplate(mood, input.style);

  const perSlide =
    input.density === "detalhado"
      ? input.displayMode === "telao"
        ? 0.9
        : 1.25
      : input.density === "direto"
        ? input.displayMode === "telao"
          ? 1.8
          : 2.4
        : input.displayMode === "telao"
          ? 1.25
          : 1.8;
  const styleMultiplier =
    input.style === "estudo-biblico"
      ? 1.35
      : input.style === "conferencia"
        ? 1.18
        : input.style === "jovens"
          ? 0.95
          : 1;
  const target = Math.round((sentences.length / perSlide) * styleMultiplier);
  const minimum = input.density === "detalhado" || input.style === "estudo-biblico" ? 10 : 5;
  const count = Math.min(50, Math.max(minimum, target + 2));
  const chunks = chunk(
    sentences,
    Math.max(1, Math.ceil(sentences.length / Math.max(count - 2, 1))),
  );

  const verseMatches = Array.from(
    text.matchAll(
      /\b([1-3]?\s?[A-ZÁÉÍÓÚÂÊÔÃÕÇa-záéíóúâêôãõç]+)\s+(\d{1,3})(?::(\d{1,3})(?:[-–](\d{1,3}))?)?\b/g,
    ),
  )
    .map((m) => m[0])
    .slice(0, 4);

  const middle: SlideDeckResponse["slides"] = chunks.slice(0, count - 2).map((group, i) => {
    const isReflection = i % 2 !== 0;
    return {
      id: `s-${i + 2}`,
      type: isReflection ? "reflection" : "topic",
      layout: isReflection ? "quote" : "points",
      highlight: false,
      title: shorten(group[0] ?? `Ponto ${i + 1}`, 60),
      bullets: isReflection
        ? []
        : group
            .slice(0, maxBullets)
            .map((s) => shorten(s, input.displayMode === "telao" ? 42 : 88)),
      verse: isReflection ? shorten(group[0] ?? "", 160) : undefined,
      speakerNote: input.generateOperatorNotes
        ? "Reforce a ideia central deste bloco antes de avançar."
        : "",
      visualHint: isReflection ? "Reflexão centralizada" : "Tópicos curtos",
      rhetoricalRole: isReflection ? "tese" : "explicacao",
      visualRole: isReflection ? "impacto" : "ensino",
      visualDirection: isReflection
        ? {
            atmosphere: mood === "ensino" ? "didatico" : "contemplativo",
            background: motifs[0] ? "simbolo" : "sem_imagem",
            symbol: motifs[0],
            intensity: "baixo",
          }
        : undefined,
    };
  });

  const slides: SlideDeckResponse["slides"] = [
    {
      id: "s-1",
      type: "title",
      layout: "cover",
      highlight: true,
      title,
      subtitle: input.series || input.theme || undefined,
      bullets: [],
      speakerNote: input.generateOperatorNotes ? "Apresentar título e contexto da pregação." : "",
      visualHint: "Abertura, sem excessos",
      rhetoricalRole: "abertura",
      visualRole: "hero",
      visualDirection: {
        atmosphere: mood === "chamada" ? "urgente" : mood === "ensino" ? "didatico" : "solene",
        background: motifs[0] ? "simbolo" : "sem_imagem",
        symbol: motifs[0],
        intensity: "medio",
      },
    },
    ...middle,
  ];

  if (input.highlightVerses && verseMatches.length > 0) {
    slides.push({
      id: `s-${slides.length + 1}`,
      type: "verse",
      layout: "scripture",
      highlight: true,
      title: verseMatches[0],
      reference: verseMatches[0],
      bullets: [],
      verse: "“…” (texto do versículo conforme o roteiro original).",
      speakerNote: "Ler com pausa. Destacar a referência.",
      visualHint: "Versículo em destaque",
      rhetoricalRole: "texto_base",
      visualRole: "leitura",
    });
  }

  slides.push({
    id: `s-${slides.length + 1}`,
    type: "application",
    layout: "points",
    highlight: false,
    title: "Aplicação prática",
    bullets: ["Reflita sobre a semana", "Dê um passo concreto", "Compartilhe com alguém"].slice(
      0,
      maxBullets,
    ),
    speakerNote: input.generateOperatorNotes ? "Espaço para chamada à ação." : "",
    visualHint: "Tópicos curtos",
    rhetoricalRole: "aplicacao",
    visualRole: "ensino",
  });

  slides.push({
    id: `s-${slides.length + 1}`,
    type: "conclusion",
    layout: "closing",
    highlight: false,
    title: "Vamos viver isso",
    subtitle: "Recapitulação e oração",
    bullets: [],
    speakerNote: "Encerramento e oração final.",
    visualHint: "Fechamento sereno",
    rhetoricalRole: "fechamento",
    visualRole: "resposta",
  });

  return {
    title,
    summary: "Prévia estruturada a partir do roteiro enviado.",
    estimatedDurationMinutes: Math.max(8, slides.length * 2),
    creativeDirection: {
      centralTheme: title,
      sermonThesis: sentences[0] || "Mensagem estruturada a partir do roteiro enviado.",
      biblicalAnchor: verseMatches[0],
      sermonMovement: mood === "chamada" ? "convite" : mood === "consolo" ? "consolo" : "ensino",
      emotionalArc: ["abertura", "desenvolvimento", "aplicação", "resposta"],
      pastoralTone: "Claro, pastoral e fiel ao roteiro.",
      visualRationale:
        "Modo demonstração: tema visual sugerido por palavras-chave de tom e símbolos encontrados no roteiro.",
      recommendedTemplate,
      recommendedMood: mood,
      recommendedMotifs: motifs,
      avoidVisuals: ["símbolos sem apoio no roteiro", "frases genéricas"],
    },
    motifs,
    mood,
    slides,
  };
}

function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function shorten(s: string, max: number) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : t.slice(0, max - 1).trimEnd() + "…";
}

function splitLongText(value: string, max: number): string[] {
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return [];
  if (text.length <= max) return [text];

  const words = text.split(" ");
  const chunks: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > max) {
      if (current) chunks.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}
