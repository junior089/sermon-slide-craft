import { z } from "zod";
import { TRANSLATION_KEYS } from "@/lib/bible/translations";

export const slideTemplateSchema = z.enum([
  "cinematic",
  "worship",
  "scripture",
  "bold",
  "minimal",
  "aurora",
  "slate",
  "dawn",
  "tide",
  "mono",
  "majesty",
  "horizon",
]);

export const slideTypeSchema = z.enum([
  "title",
  "topic",
  "verse",
  "reflection",
  "application",
  "conclusion",
]);

export const slideLayoutSchema = z.enum([
  "cover",
  "statement",
  "scripture",
  "points",
  "quote",
  "closing",
]);

export const moodSchema = z.enum([
  "solene",
  "consolo",
  "celebracao",
  "ensino",
  "adoracao",
  "chamada",
]);

export const motifSchema = z.enum([
  "pao",
  "peixe",
  "mar",
  "ondas",
  "fogo",
  "luz",
  "trigo",
  "videira",
  "pomba",
  "coroa",
  "cruz",
  "monte",
  "tempestade",
  "ancora",
  "semente",
  "caminho",
  "agua",
  "lampada",
  "estrela",
  "pedra",
  "deserto",
  "jardim",
  "templo",
  "altar",
  "mesa",
  "porta",
  "veu",
  "cordeiro",
  "oleo",
  "rio",
  "cidade",
  "muralha",
  "vale",
  "pastor",
  "ovelha",
  "escudo",
  "espada",
  "coracao",
  "mente",
]);

export const motifTreatmentSchema = z.enum(["watermark", "horizon", "ornament", "texture"]);

export const sermonMovementSchema = z.enum([
  "exposicao",
  "ensino",
  "consolo",
  "confronto",
  "convite",
  "celebracao",
]);

export const rhetoricalRoleSchema = z.enum([
  "abertura",
  "texto_base",
  "tese",
  "explicacao",
  "transicao",
  "aplicacao",
  "apelo",
  "fechamento",
]);

export const visualRoleSchema = z.enum([
  "hero",
  "leitura",
  "ensino",
  "impacto",
  "respiro",
  "resposta",
]);

export const visualDirectionSchema = z
  .object({
    atmosphere: z
      .enum(["solene", "leve", "urgente", "contemplativo", "didatico"])
      .optional()
      .catch(undefined),
    background: z
      .enum(["sem_imagem", "textura", "paisagem", "luz", "simbolo"])
      .optional()
      .catch(undefined),
    symbol: motifSchema.optional().catch(undefined),
    treatment: motifTreatmentSchema.optional().catch(undefined),
    intensity: z.enum(["baixo", "medio", "alto"]).optional().catch(undefined),
  })
  .optional()
  .catch(undefined);

export const creativeDirectionSchema = z
  .object({
    centralTheme: z.string().max(220).default("Mensagem"),
    sermonThesis: z.string().max(420).default(""),
    biblicalAnchor: z.string().max(120).optional().catch(undefined),
    sermonMovement: sermonMovementSchema.default("ensino").catch("ensino"),
    emotionalArc: z.array(z.string().max(80)).max(8).default([]).catch([]),
    pastoralTone: z.string().max(240).default("Claro, pastoral e fiel ao roteiro."),
    visualRationale: z.string().max(520).default("Visual definido a partir do tema da mensagem."),
    recommendedTemplate: slideTemplateSchema.default("cinematic").catch("cinematic"),
    recommendedMood: moodSchema.default("ensino").catch("ensino"),
    recommendedMotifs: z.array(motifSchema).max(4).default([]).catch([]),
    avoidVisuals: z.array(z.string().max(120)).max(8).default([]).catch([]),
  })
  .optional()
  .catch(undefined);

export const slideSchema = z.object({
  id: z.string().min(1),
  type: slideTypeSchema,
  // O modelo às vezes inventa valores. Em vez de invalidar o deck inteiro, campos
  // fora do vocabulário viram undefined e são derivados na normalização.
  layout: slideLayoutSchema.optional().catch(undefined),
  highlight: z.boolean().optional().default(false).catch(false),
  // Limites folgados: a normalização pagina o texto antes de renderizar.
  title: z.string().min(1).max(1000),
  subtitle: z
    .string()
    .max(1000)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  bullets: z.array(z.string().max(2000)).max(80).default([]),
  verse: z
    .string()
    .max(5000)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  reference: z
    .string()
    .max(80)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  speakerNote: z.string().max(800).default(""),
  visualHint: z.string().max(200).default(""),
  motif: z.string().max(40).optional().catch(undefined),
  motifTreatment: motifTreatmentSchema.optional().catch(undefined),
  mood: z.string().max(40).optional().catch(undefined),
  rhetoricalRole: rhetoricalRoleSchema.optional().catch(undefined),
  visualRole: visualRoleSchema.optional().catch(undefined),
  visualDirection: visualDirectionSchema,
});

export const slideDeckResponseSchema = z.object({
  title: z.string().min(1).max(160),
  summary: z.string().max(800),
  estimatedDurationMinutes: z.number().int().min(1).max(180),
  creativeDirection: creativeDirectionSchema,
  motifs: z.array(z.string().max(40)).max(6).optional().default([]),
  mood: z.string().max(40).optional().catch(undefined),
  slides: z.array(slideSchema).min(3).max(80),
});

export type SlideDeckResponse = z.infer<typeof slideDeckResponseSchema>;

export const generationSettingsSchema = z.object({
  theme: z.string().max(200).optional().default(""),
  series: z.string().max(120).optional().default(""),
  preacher: z.string().max(120).optional().default(""),
  preferredTemplate: slideTemplateSchema.optional().catch(undefined),
  templateLocked: z.boolean().optional().default(false),
  text: z.string().min(40, "Cole um roteiro com pelo menos 40 caracteres.").max(20000),
  style: z.enum(["culto-principal", "estudo-biblico", "jovens", "conferencia"]),
  density: z.enum(["direto", "equilibrado", "detalhado"]),
  displayMode: z.enum(["telao", "tela", "impressao"]).default("telao"),
  translation: z.enum(TRANSLATION_KEYS).optional().default("almeida").catch("almeida"),
  highlightVerses: z.boolean(),
  generateOperatorNotes: z.boolean(),
  suggestBlocks: z.boolean(),
});

export type GenerationInput = z.infer<typeof generationSettingsSchema>;
