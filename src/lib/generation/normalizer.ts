import type { GenerationInput, SlideDeckResponse } from "@/lib/generation/schemas";
import { slideDeckResponseSchema, slideTemplateSchema } from "@/lib/generation/schemas";
import { maxBulletsFor, recommendTemplate } from "@/lib/slide-presets";
import { detectMotifs, isMotifKey, type MotifKey } from "@/lib/generation/motifs";
import { detectMood, isMoodKey, type MoodKey } from "@/lib/generation/moods";

type Slide = SlideDeckResponse["slides"][number];

const TYPE_TO_LAYOUT: Record<Slide["type"], NonNullable<Slide["layout"]>> = {
  title: "cover",
  topic: "points",
  verse: "scripture",
  reflection: "quote",
  application: "points",
  conclusion: "closing",
};

const LAYOUT_TO_TYPE: Record<NonNullable<Slide["layout"]>, Slide["type"]> = {
  cover: "title",
  statement: "reflection",
  scripture: "verse",
  points: "topic",
  quote: "reflection",
  closing: "conclusion",
};

const MAX_SLIDES = 80;
const TITLE_LIMIT = 140;
const SUBTITLE_LIMIT = 200;
const SCRIPTURE_LIMIT = 360;
const QUOTE_LIMIT = 360;

// Corrige o formato e a legibilidade de um deck já validado, sem mudar o conteúdo.
export function normalizeAiDeck(
  deck: SlideDeckResponse,
  input: GenerationInput,
): SlideDeckResponse {
  const deckTitle = clean(deck.title) || clean(input.theme) || "Mensagem";
  const maxBullets = maxBulletsFor(input.displayMode);

  let slides = deck.slides.flatMap((slide) => normalizeSlide(slide, input, maxBullets));

  if (!isCover(slides[0])) {
    slides.unshift(createCoverSlide(deckTitle, input));
  }

  if (!isClosing(slides[slides.length - 1])) {
    slides.push(createClosingSlide(input));
  }

  slides = slides
    .map((slide, index, all) => {
      if (index === 0) return normalizeSlide(asCover(slide, deckTitle, input), input, maxBullets);
      if (index === all.length - 1)
        return normalizeSlide(asClosing(slide, input), input, maxBullets);
      if (isCover(slide) || isClosing(slide)) {
        return normalizeSlide(
          {
            ...slide,
            type: slide.verse ? "reflection" : "topic",
            layout: slide.verse ? "quote" : "points",
          },
          input,
          maxBullets,
        );
      }
      return slide;
    })
    .flat();

  if (slides.length > MAX_SLIDES) {
    slides = [slides[0], ...slides.slice(1, MAX_SLIDES - 1), slides[slides.length - 1]];
  }

  slides = normalizeHighlights(slides, input).map((slide, index) => ({
    ...slide,
    id: `s-${index + 1}`,
  }));

  const aiMotifs = (deck.motifs ?? []).filter(isMotifKey);
  const motifs: MotifKey[] = aiMotifs.length > 0 ? dedupe(aiMotifs) : detectMotifs(input.text);

  const mood = isMoodKey(deck.mood) ? deck.mood : detectMood(`${input.theme ?? ""} ${input.text}`);

  const creativeDirection = normalizeCreativeDirection(deck, input, motifs, mood);

  return slideDeckResponseSchema.parse({
    title: truncate(deckTitle, 160),
    summary: truncate(clean(deck.summary) || "Apresentação estruturada a partir do roteiro.", 800),
    estimatedDurationMinutes: clampDuration(deck.estimatedDurationMinutes, slides.length),
    creativeDirection,
    motifs,
    mood,
    slides,
  });
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function normalizeSlide(slide: Slide, input: GenerationInput, maxBullets: number): Slide[] {
  const layout = slide.layout || TYPE_TO_LAYOUT[slide.type];
  const type = slide.type || LAYOUT_TO_TYPE[layout];
  const bulletLimit = input.displayMode === "telao" ? 48 : input.displayMode === "tela" ? 90 : 120;
  const title = truncate(clean(slide.title) || fallbackTitle(layout, input.theme), TITLE_LIMIT);

  const normalized: Slide = {
    ...slide,
    type,
    layout,
    highlight: Boolean(slide.highlight),
    title,
    subtitle: optional(truncate(clean(slide.subtitle), SUBTITLE_LIMIT)),
    bullets: slide.bullets
      .flatMap((bullet) => splitText(clean(bullet), bulletLimit))
      .filter(Boolean),
    verse: optional(clean(slide.verse)),
    reference: optional(truncate(clean(slide.reference), 80)),
    speakerNote: truncate(clean(slide.speakerNote) || defaultSpeakerNote(layout), 800),
    visualHint: truncate(clean(slide.visualHint) || defaultVisualHint(layout), 200),
    // O modelo pode inventar chaves; fora do registro, o campo é descartado.
    motif: isMotifKey(slide.motif) ? slide.motif : undefined,
    motifTreatment: slide.motifTreatment,
    mood: isMoodKey(slide.mood) ? slide.mood : undefined,
    rhetoricalRole: slide.rhetoricalRole,
    visualRole: slide.visualRole ?? deriveVisualRole(layout, slide.rhetoricalRole, slide.highlight),
    visualDirection: normalizeVisualDirection(slide.visualDirection),
  };

  if (
    layout === "cover" ||
    layout === "statement" ||
    layout === "scripture" ||
    layout === "quote"
  ) {
    normalized.bullets = [];
  }

  if (layout === "cover" || layout === "points" || layout === "closing") {
    normalized.verse = undefined;
    normalized.reference = undefined;
  }

  if (layout === "scripture") {
    normalized.type = "verse";
    normalized.title = normalized.reference || normalized.title;
  }

  if (layout === "closing") {
    normalized.type = "conclusion";
    normalized.bullets = [];
  }

  if (layout === "cover") {
    normalized.type = "title";
  }

  return paginateSlide(normalized, maxBullets, bulletLimit);
}

// Páginas de continuação repetem o título sem rótulos como "(cont. 2)", que
// apareceriam no telão.
function paginateSlide(slide: Slide, maxBullets: number, bulletLimit: number): Slide[] {
  if (slide.layout === "scripture") {
    const chunks = splitText(slide.verse, SCRIPTURE_LIMIT);
    if (chunks.length <= 1) return [{ ...slide, verse: chunks[0] }];
    return chunks.map((verse, index) => ({
      ...slide,
      highlight: index === 0 ? slide.highlight : false,
      title: truncate(slide.title, TITLE_LIMIT),
      verse,
      speakerNote: continuationNote(slide.speakerNote, index),
    }));
  }

  if (slide.layout === "quote") {
    const chunks = splitText(slide.verse || slide.title, QUOTE_LIMIT);
    if (chunks.length <= 1) {
      return [
        {
          ...slide,
          title: slide.verse ? slide.title : truncate(chunks[0] || slide.title, TITLE_LIMIT),
          verse: slide.verse ? chunks[0] : slide.verse,
        },
      ];
    }
    return chunks.map((verse, index) => ({
      ...slide,
      highlight: index === 0 ? slide.highlight : false,
      title: truncate(slide.title, TITLE_LIMIT),
      verse,
      speakerNote: continuationNote(slide.speakerNote, index),
    }));
  }

  if (slide.layout === "statement") {
    const chunks = splitText(slide.title, TITLE_LIMIT);
    if (chunks.length <= 1) return [{ ...slide, title: chunks[0] || slide.title }];
    return chunks.map((title, index) => ({
      ...slide,
      highlight: index === 0 ? slide.highlight : false,
      title,
      subtitle: index === 0 ? slide.subtitle : optional(truncate(slide.subtitle, SUBTITLE_LIMIT)),
      speakerNote: continuationNote(slide.speakerNote, index),
    }));
  }

  if (slide.layout === "points" && slide.bullets.length > maxBullets) {
    const pages = chunk(slide.bullets, maxBullets);
    return pages.map((bullets, index) => ({
      ...slide,
      highlight: index === 0 ? slide.highlight : false,
      title: truncate(slide.title, TITLE_LIMIT),
      subtitle: index === 0 ? slide.subtitle : optional(truncate(slide.subtitle, SUBTITLE_LIMIT)),
      bullets: bullets.map((bullet) => truncate(bullet, bulletLimit)),
      speakerNote: continuationNote(slide.speakerNote, index),
    }));
  }

  return [
    {
      ...slide,
      bullets: slide.bullets.slice(0, maxBullets).map((bullet) => truncate(bullet, bulletLimit)),
      verse: optional(truncate(slide.verse, SCRIPTURE_LIMIT)),
    },
  ];
}

function normalizeHighlights(slides: Slide[], input: GenerationInput): Slide[] {
  let highlighted = slides.filter((slide) => slide.highlight).length;
  const desiredMinimum =
    input.density === "detalhado" ||
    input.style === "estudo-biblico" ||
    input.style === "conferencia"
      ? 2
      : 1;
  const maxHighlights = input.density === "detalhado" || input.style === "estudo-biblico" ? 4 : 3;

  if (highlighted === 0) {
    const index = slides.findIndex(
      (slide) => slide.layout === "scripture" || slide.layout === "statement",
    );
    const fallbackIndex = index >= 0 ? index : Math.min(1, slides.length - 1);
    slides[fallbackIndex] = { ...slides[fallbackIndex], highlight: true };
    highlighted = 1;
  }

  if (highlighted < desiredMinimum) {
    const candidates = slides
      .map((slide, index) => ({ slide, index }))
      .filter(
        ({ slide, index }) =>
          index > 0 &&
          index < slides.length - 1 &&
          !slide.highlight &&
          (slide.layout === "statement" ||
            slide.layout === "scripture" ||
            slide.rhetoricalRole === "tese" ||
            slide.rhetoricalRole === "aplicacao"),
      )
      .slice(0, desiredMinimum - highlighted);

    for (const { index } of candidates) {
      slides[index] = { ...slides[index], highlight: true };
      highlighted += 1;
    }
  }

  let kept = 0;
  return slides.map((slide) => {
    if (!slide.highlight) return slide;
    kept += 1;
    return { ...slide, highlight: kept <= maxHighlights };
  });
}

function createCoverSlide(title: string, input: GenerationInput): Slide {
  return {
    id: "s-1",
    type: "title",
    layout: "cover",
    highlight: true,
    title,
    subtitle: optional(clean(input.series) || clean(input.theme)),
    bullets: [],
    speakerNote: "Abrir a mensagem com clareza e manter até o início da fala.",
    visualHint: "abertura solene",
  };
}

function createClosingSlide(input: GenerationInput): Slide {
  return {
    id: "s-final",
    type: "conclusion",
    layout: "closing",
    highlight: false,
    title: input.style === "estudo-biblico" ? "Para guardar" : "Vamos responder",
    subtitle: "Recapitulação e oração",
    bullets: [],
    speakerNote: "Manter durante a conclusão e a oração final.",
    visualHint: "fechamento",
  };
}

function asCover(slide: Slide, title: string, input: GenerationInput): Slide {
  return {
    ...slide,
    type: "title",
    layout: "cover",
    title: slide.title || title,
    subtitle: slide.subtitle || optional(clean(input.series) || clean(input.theme)),
    bullets: [],
    verse: undefined,
    reference: undefined,
  };
}

function asClosing(slide: Slide, input: GenerationInput): Slide {
  return {
    ...slide,
    type: "conclusion",
    layout: "closing",
    title: slide.title || (input.style === "estudo-biblico" ? "Para guardar" : "Vamos responder"),
    bullets: [],
    verse: undefined,
    reference: undefined,
  };
}

function isCover(slide?: Slide) {
  return slide?.type === "title" && slide.layout === "cover";
}

function isClosing(slide?: Slide) {
  return slide?.type === "conclusion" && slide.layout === "closing";
}

function defaultSpeakerNote(layout?: Slide["layout"]) {
  if (layout === "scripture") return "Ler com pausa e destacar a referência.";
  if (layout === "cover") return "Abrir a mensagem com pausa.";
  if (layout === "closing") return "Manter durante a conclusão.";
  return "Avançar conforme o desenvolvimento da mensagem.";
}

function defaultVisualHint(layout?: Slide["layout"]) {
  if (layout === "scripture") return "leitura bíblica";
  if (layout === "cover") return "abertura";
  if (layout === "closing") return "fechamento";
  if (layout === "statement") return "tese central";
  if (layout === "quote") return "reflexão central";
  return "desenvolvimento";
}

function fallbackTitle(layout?: Slide["layout"], theme?: string) {
  const t = clean(theme);
  if (layout === "scripture") return "Palavra";
  if (layout === "closing") return "Conclusão";
  return t || "Mensagem";
}

function clean(value?: string) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function optional(value?: string) {
  return value && value.length > 0 ? value : undefined;
}

function truncate(value: string | undefined, max: number) {
  const text = clean(value);
  if (text.length <= max) return text;
  return text.slice(0, Math.max(0, max - 3)).trimEnd() + "...";
}

function splitText(value: string | undefined, max: number): string[] {
  const text = clean(value);
  if (!text) return [];
  if (text.length <= max) return [text];

  const words = text.split(" ");
  const chunks: string[] = [];
  let current = "";

  for (const word of words) {
    if (word.length > max) {
      if (current) {
        chunks.push(current);
        current = "";
      }
      for (let i = 0; i < word.length; i += max) {
        chunks.push(word.slice(i, i + max));
      }
      continue;
    }

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

function continuationNote(note: string, index: number) {
  if (index === 0) return note;
  return truncate(`${note} Continuar a leitura deste bloco.`, 800);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function clampDuration(value: number, slideCount: number) {
  if (Number.isFinite(value)) return Math.min(180, Math.max(1, Math.round(value)));
  return Math.min(180, Math.max(1, slideCount * 2));
}

function normalizeCreativeDirection(
  deck: SlideDeckResponse,
  input: GenerationInput,
  motifs: MotifKey[],
  mood?: MoodKey,
): NonNullable<SlideDeckResponse["creativeDirection"]> {
  const direction = deck.creativeDirection;
  const recommendedMood = isMoodKey(direction?.recommendedMood)
    ? direction.recommendedMood
    : mood || "ensino";
  const parsedTemplate = slideTemplateSchema.safeParse(direction?.recommendedTemplate);
  const recommendedTemplate = parsedTemplate.success
    ? parsedTemplate.data
    : recommendTemplate(recommendedMood, input.style);
  const recommendedMotifs = (direction?.recommendedMotifs ?? []).filter(isMotifKey);

  return {
    centralTheme: truncate(
      clean(direction?.centralTheme) || clean(input.theme) || clean(deck.title) || "Mensagem",
      220,
    ),
    sermonThesis: truncate(
      clean(direction?.sermonThesis) ||
        clean(deck.summary) ||
        "Mensagem estruturada a partir do roteiro enviado.",
      420,
    ),
    biblicalAnchor: optional(truncate(clean(direction?.biblicalAnchor), 120)),
    sermonMovement: direction?.sermonMovement || movementForMood(recommendedMood),
    emotionalArc:
      direction?.emotionalArc
        ?.map((item) => truncate(clean(item), 80))
        .filter(Boolean)
        .slice(0, 8) ?? [],
    pastoralTone: truncate(
      clean(direction?.pastoralTone) || "Claro, pastoral e fiel ao roteiro.",
      240,
    ),
    visualRationale: truncate(
      clean(direction?.visualRationale) ||
        `Visual recomendado a partir do tom ${recommendedMood} e dos símbolos centrais da mensagem.`,
      520,
    ),
    recommendedTemplate,
    recommendedMood,
    recommendedMotifs: recommendedMotifs.length
      ? dedupe(recommendedMotifs).slice(0, 4)
      : motifs.slice(0, 4),
    avoidVisuals:
      direction?.avoidVisuals
        ?.map((item) => truncate(clean(item), 120))
        .filter(Boolean)
        .slice(0, 8) ?? [],
  };
}

function deriveVisualRole(
  layout: NonNullable<Slide["layout"]>,
  rhetoricalRole: Slide["rhetoricalRole"],
  highlight?: boolean,
): NonNullable<Slide["visualRole"]> {
  if (layout === "cover") return "hero";
  if (layout === "closing") return "resposta";
  if (layout === "scripture") return "leitura";
  if (layout === "statement") return "impacto";
  if (rhetoricalRole === "tese" || rhetoricalRole === "apelo") return "impacto";
  if (rhetoricalRole === "transicao") return "respiro";
  if (layout === "quote") return highlight ? "impacto" : "respiro";
  return "ensino";
}

function normalizeVisualDirection(value: Slide["visualDirection"]): Slide["visualDirection"] {
  if (!value) return undefined;
  return {
    atmosphere: value.atmosphere,
    background: value.background,
    symbol: isMotifKey(value.symbol) ? value.symbol : undefined,
    treatment: value.treatment,
    intensity: value.intensity,
  };
}

function movementForMood(
  mood: MoodKey,
): NonNullable<SlideDeckResponse["creativeDirection"]>["sermonMovement"] {
  if (mood === "consolo") return "consolo";
  if (mood === "celebracao") return "celebracao";
  if (mood === "chamada") return "convite";
  if (mood === "solene") return "confronto";
  return "ensino";
}
