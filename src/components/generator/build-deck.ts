import type { GenerateSlidesResult } from "@/lib/generation/generate-slides";
import type { BrandKit } from "@/lib/storage/brand-kit";
import type { GenerationSettings, Slide, SlideDeck, SlideTemplate } from "@/types/slides";

export interface MessageFields {
  text: string;
  theme: string;
  series: string;
  preacher: string;
}

export function computeFormMetrics(fields: MessageFields, settings: GenerationSettings) {
  const { text, theme, series, preacher } = fields;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const readMinutes = Math.max(1, Math.ceil(words / 130));
  const wordsPerSlide =
    settings.density === "direto" ? 95 : settings.density === "detalhado" ? 45 : 70;
  const styleMultiplier =
    settings.style === "estudo-biblico"
      ? 1.35
      : settings.style === "conferencia"
        ? 1.18
        : settings.style === "jovens"
          ? 0.95
          : 1;
  const minimumSlides =
    settings.density === "detalhado" || settings.style === "estudo-biblico" ? 10 : 5;
  const suggestedSlides =
    words === 0
      ? 0
      : Math.max(
          minimumSlides,
          Math.min(36, Math.round((words / wordsPerSlide) * styleMultiplier + 4)),
        );
  const readiness = [
    text.trim().length >= 40,
    Boolean(theme.trim()),
    Boolean(series.trim() || preacher.trim()),
    settings.highlightVerses || settings.generateOperatorNotes || settings.suggestBlocks,
  ].filter(Boolean).length;
  return { words, readMinutes, suggestedSlides, readiness };
}

// Deck com capa e um versículo para a galeria mostrar cada tema antes da geração.
export function createSampleDeck(
  fields: Omit<MessageFields, "text">,
  template: SlideTemplate,
  settings: GenerationSettings,
): SlideDeck {
  const title = fields.theme.trim() || "Título da mensagem";
  return {
    id: "sample",
    createdAt: 0,
    title,
    summary: "",
    estimatedDurationMinutes: 0,
    template,
    displayMode: settings.displayMode,
    source: "demo",
    series: fields.series.trim() || undefined,
    preacher: fields.preacher.trim() || undefined,
    slides: [
      {
        id: "sample-cover",
        type: "title",
        layout: "cover",
        highlight: true,
        title,
        subtitle: fields.series.trim() || undefined,
        bullets: [],
        speakerNote: "",
        visualHint: "",
      },
      {
        id: "sample-verse",
        type: "verse",
        layout: "scripture",
        highlight: false,
        title: "Salmos 23:1",
        reference: "Salmos 23:1",
        verse: "O Senhor é o meu pastor; nada me faltará.",
        bullets: [],
        speakerNote: "",
        visualHint: "",
      },
    ],
    settings: { ...settings, ...fields },
  };
}

export function buildDeckFromResult({
  result,
  fields,
  settings,
  template,
  templateLocked,
  brandKit,
  now = Date.now(),
}: {
  result: GenerateSlidesResult;
  fields: Omit<MessageFields, "text">;
  settings: GenerationSettings;
  template: SlideTemplate;
  templateLocked: boolean;
  brandKit: BrandKit;
  now?: number;
}): SlideDeck {
  const generated = result.deck;
  const recommendedTemplate = generated.creativeDirection?.recommendedTemplate as
    SlideTemplate | undefined;
  const selectedTemplate = !templateLocked && recommendedTemplate ? recommendedTemplate : template;
  const usedRecommendedTemplate = selectedTemplate === recommendedTemplate && !templateLocked;

  return {
    id: `deck-${now}`,
    createdAt: now,
    title: generated.title,
    summary: generated.summary,
    estimatedDurationMinutes: generated.estimatedDurationMinutes,
    template: selectedTemplate,
    displayMode: settings.displayMode,
    source: result.source,
    series: fields.series.trim() || undefined,
    preacher: fields.preacher.trim() || undefined,
    accentColor: brandKit.accentColor,
    churchName: brandKit.churchName,
    logo: brandKit.logo,
    motifs: generated.motifs as SlideDeck["motifs"],
    mood: generated.mood as SlideDeck["mood"],
    creativeDirection: generated.creativeDirection as SlideDeck["creativeDirection"],
    aiTrace: {
      ...result.trace,
      usedRecommendedTemplate,
      selectedTemplate,
      notes: [
        ...result.trace.notes,
        templateLocked
          ? "O usuário escolheu o template antes da geração; a recomendação do modelo ficou só como referência."
          : "Nenhum template foi fixado pelo usuário; o app aplicou a recomendação visual do modelo quando havia.",
      ],
    },
    slides: generated.slides.map((s): Slide => ({
      id: s.id,
      type: s.type,
      layout: s.layout,
      highlight: s.highlight ?? false,
      title: s.title,
      subtitle: s.subtitle,
      bullets: s.bullets ?? [],
      verse: s.verse,
      reference: s.reference,
      speakerNote: s.speakerNote ?? "",
      visualHint: s.visualHint ?? "",
      motif: s.motif as Slide["motif"],
      motifTreatment: s.motifTreatment,
      mood: s.mood as Slide["mood"],
      rhetoricalRole: s.rhetoricalRole as Slide["rhetoricalRole"],
      visualRole: s.visualRole as Slide["visualRole"],
      visualDirection: s.visualDirection as Slide["visualDirection"],
    })),
    settings: {
      ...settings,
      ...fields,
      preferredTemplate: template,
      templateLocked,
    },
  };
}
