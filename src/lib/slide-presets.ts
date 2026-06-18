import type { MoodKey } from "@/lib/generation/moods";
import type {
  DisplayMode,
  GenerationSettings,
  Slide,
  SlideLayout,
  SlideTemplate,
  SlideType,
} from "@/types/slides";

export interface TemplateMeta {
  value: SlideTemplate;
  label: string;
  hint: string;
  tone: "dark" | "light";
  bestFor: string[];
  avoidFor: string[];
  moods: string[];
  visualLanguage: string;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    value: "cinematic",
    label: "Cinema",
    hint: "Preto + brilho dourado",
    tone: "dark",
    bestFor: ["reverência", "tese forte", "santidade", "mensagem solene"],
    avoidFor: ["celebração leve", "ensino com muito conteúdo"],
    moods: ["solene", "adoracao"],
    visualLanguage: "fundo escuro, vinheta, brilho dourado, clima de abertura reverente",
  },
  {
    value: "worship",
    label: "Louvor",
    hint: "Gradiente índigo",
    tone: "dark",
    bestFor: ["adoração", "presença", "entrega", "intimidade"],
    avoidFor: ["estudo técnico", "confronto pesado"],
    moods: ["adoracao", "consolo"],
    visualLanguage: "halo índigo/violeta, serifa suave, atmosfera contemplativa",
  },
  {
    value: "aurora",
    label: "Aurora",
    hint: "Verde-azulado moderno",
    tone: "dark",
    bestFor: ["esperança", "renovo", "cura", "mensagem contemporânea"],
    avoidFor: ["juízo severo", "liturgia muito clássica"],
    moods: ["consolo", "ensino"],
    visualLanguage: "verde-azulado moderno, luz lateral, composição arejada",
  },
  {
    value: "bold",
    label: "Impacto",
    hint: "Gradiente quente, título gigante",
    tone: "dark",
    bestFor: ["chamada", "decisão", "juventude", "frases curtas de impacto"],
    avoidFor: ["lamento", "texto bíblico longo", "ensino detalhado"],
    moods: ["chamada", "celebracao"],
    visualLanguage: "gradiente quente, título gigante, energia alta",
  },
  {
    value: "slate",
    label: "Ensino",
    hint: "Grafite sóbrio, editorial",
    tone: "dark",
    bestFor: ["estudo bíblico", "doutrina", "exposição", "listas e blocos"],
    avoidFor: ["celebração visual", "apelo emocional intenso"],
    moods: ["ensino", "solene"],
    visualLanguage: "grafite sobrio, regua editorial, leitura clara",
  },
  {
    value: "scripture",
    label: "Palavra",
    hint: "Creme + serifa clássica",
    tone: "light",
    bestFor: ["texto bíblico", "exposição clássica", "sabedoria", "devocional"],
    avoidFor: ["juventude urbana", "impacto agressivo"],
    moods: ["ensino", "consolo"],
    visualLanguage: "creme, moldura clássica, serifa, reverência textual",
  },
  {
    value: "minimal",
    label: "Sereno",
    hint: "Branco editorial, minimalista",
    tone: "light",
    bestFor: ["clareza", "reflexão", "simplicidade", "aplicação pastoral"],
    avoidFor: ["ambiente escuro de conferência", "temas dramáticos"],
    moods: ["ensino", "consolo"],
    visualLanguage: "branco editorial, pouco ornamento, foco no texto",
  },
  {
    value: "dawn",
    label: "Alvorada",
    hint: "Quente e moderno, âmbar/creme",
    tone: "light",
    bestFor: ["esperança", "família", "graça", "novo começo"],
    avoidFor: ["juízo pesado", "noite/agonia"],
    moods: ["consolo", "celebracao"],
    visualLanguage: "tons quentes, luz de manha, acolhimento pastoral",
  },
  {
    value: "tide",
    label: "Maré",
    hint: "Jovem e urbano, cyan elétrico",
    tone: "dark",
    bestFor: ["jovens", "missão", "movimento", "decisão direta"],
    avoidFor: ["liturgia clássica", "texto longo"],
    moods: ["chamada", "celebracao"],
    visualLanguage: "azul/cyan urbano, blocos gráficos, energia contemporânea",
  },
  {
    value: "mono",
    label: "Contraste",
    hint: "Monocromático, tipografia gigante",
    tone: "dark",
    bestFor: ["confronto", "arrependimento", "verdade direta", "frases curtas"],
    avoidFor: ["consolo delicado", "ensino com muitos detalhes"],
    moods: ["solene", "chamada"],
    visualLanguage: "preto e branco, tipografia dura, máxima clareza",
  },
  {
    value: "majesty",
    label: "Majestade",
    hint: "Conferência sofisticada, borgonha",
    tone: "dark",
    bestFor: ["santidade", "reino", "majestade", "conferência solene"],
    avoidFor: ["jovens informal", "mensagem leve"],
    moods: ["solene", "adoracao"],
    visualLanguage: "borgonha, ouro, moldura, serifa sofisticada",
  },
  {
    value: "horizon",
    label: "Horizonte",
    hint: "Worship global, gradiente amplo",
    tone: "dark",
    bestFor: ["celebração", "missão", "resposta congregacional", "esperança ampla"],
    avoidFor: ["estudo técnico", "lamento contido"],
    moods: ["celebracao", "adoracao", "chamada"],
    visualLanguage: "gradiente amplo, linha de horizonte, atmosfera congregacional",
  },
];

export const TEMPLATE_LABEL: Record<SlideTemplate, string> = Object.fromEntries(
  TEMPLATES.map((t) => [t.value, t.label]),
) as Record<SlideTemplate, string>;

export const TEMPLATE_DECISION_GUIDE = TEMPLATES.map(
  (t) =>
    `${t.value} (${t.label}) — ideal para ${t.bestFor.join(", ")}; evite em ${t.avoidFor.join(", ")}; moods: ${t.moods.join(", ")}; linguagem visual: ${t.visualLanguage}.`,
).join("\n");

// Espelha --tpl-accent no CSS; é o valor inicial do seletor de cor de marca.
export const TEMPLATE_ACCENT: Record<SlideTemplate, string> = {
  cinematic: "#d8af66",
  worship: "#c4bcff",
  scripture: "#b89243",
  bold: "#ffffff",
  minimal: "#15171c",
  aurora: "#5eead4",
  slate: "#aeb6c2",
  dawn: "#c2761f",
  tide: "#22d3ee",
  mono: "#ffffff",
  majesty: "#d9b25e",
  horizon: "#fbc7e0",
};

export const LAYOUTS: { value: SlideLayout; label: string }[] = [
  { value: "cover", label: "Abertura" },
  { value: "statement", label: "Destaque" },
  { value: "scripture", label: "Texto bíblico" },
  { value: "points", label: "Tópicos" },
  { value: "quote", label: "Citação" },
  { value: "closing", label: "Fechamento" },
];

export const LAYOUT_LABEL: Record<SlideLayout, string> = Object.fromEntries(
  LAYOUTS.map((l) => [l.value, l.label]),
) as Record<SlideLayout, string>;

const TYPE_TO_LAYOUT: Record<SlideType, SlideLayout> = {
  title: "cover",
  topic: "points",
  verse: "scripture",
  reflection: "quote",
  application: "points",
  conclusion: "closing",
};

export function resolveLayout(
  slide: Pick<Slide, "type" | "layout" | "bullets" | "verse">,
): SlideLayout {
  if (slide.layout) return slide.layout;
  if (slide.verse && slide.bullets.length === 0) return "scripture";
  return TYPE_TO_LAYOUT[slide.type];
}

export interface DisplayModeMeta {
  value: DisplayMode;
  label: string;
  hint: string;
  maxBullets: number;
}

export const DISPLAY_MODES: DisplayModeMeta[] = [
  {
    value: "telao",
    label: "Telão",
    hint: "Texto grande e enxuto para grandes áreas (padrão).",
    maxBullets: 3,
  },
  {
    value: "tela",
    label: "Tela / transmissão",
    hint: "Equilíbrio para monitores, TVs e lives.",
    maxBullets: 5,
  },
  {
    value: "impressao",
    label: "Impressão / PDF",
    hint: "Mais conteúdo por slide para leitura próxima.",
    maxBullets: 6,
  },
];

export const DISPLAY_MODE_LABEL: Record<DisplayMode, string> = Object.fromEntries(
  DISPLAY_MODES.map((m) => [m.value, m.label]),
) as Record<DisplayMode, string>;

export function maxBulletsFor(mode: DisplayMode): number {
  return DISPLAY_MODES.find((m) => m.value === mode)?.maxBullets ?? 5;
}

// Precisa ficar igual ao limite usado na normalização.
export function maxBulletCharsFor(mode: DisplayMode): number {
  return mode === "telao" ? 48 : mode === "tela" ? 90 : 120;
}

export function recommendTemplate(
  mood: MoodKey,
  style: GenerationSettings["style"],
): SlideTemplate {
  if (style === "jovens") return mood === "solene" ? "mono" : "tide";
  if (style === "estudo-biblico") return "slate";
  if (style === "conferencia") return mood === "solene" ? "majesty" : "horizon";
  if (mood === "consolo") return "aurora";
  if (mood === "celebracao") return "horizon";
  if (mood === "adoracao") return "worship";
  if (mood === "chamada") return "bold";
  if (mood === "solene") return "cinematic";
  return "scripture";
}
