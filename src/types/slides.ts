import type { z } from "zod";

import type {
  rhetoricalRoleSchema,
  sermonMovementSchema,
  slideLayoutSchema,
  slideTemplateSchema,
  slideTypeSchema,
  visualRoleSchema,
} from "@/lib/generation/schemas";
import type { MotifKey, MotifTreatment } from "@/lib/generation/motifs";
import type { MoodKey } from "@/lib/generation/moods";
import type { TranslationKey } from "@/lib/bible/translations";

export type SlideType = z.infer<typeof slideTypeSchema>;

export type SlideTemplate = z.infer<typeof slideTemplateSchema>;

export type SlideLayout = z.infer<typeof slideLayoutSchema>;

export type DisplayMode = "telao" | "tela" | "impressao";

export type SermonMovement = z.infer<typeof sermonMovementSchema>;

export type RhetoricalRole = z.infer<typeof rhetoricalRoleSchema>;

export type VisualRole = z.infer<typeof visualRoleSchema>;

export type VisualAtmosphere = "solene" | "leve" | "urgente" | "contemplativo" | "didatico";

export type VisualBackground = "sem_imagem" | "textura" | "paisagem" | "luz" | "simbolo";

export type VisualIntensity = "baixo" | "medio" | "alto";

export interface VisualDirection {
  atmosphere?: VisualAtmosphere;
  background?: VisualBackground;
  symbol?: MotifKey;
  treatment?: MotifTreatment;
  intensity?: VisualIntensity;
}

export interface CreativeDirection {
  centralTheme: string;
  sermonThesis: string;
  biblicalAnchor?: string;
  sermonMovement: SermonMovement;
  emotionalArc: string[];
  pastoralTone: string;
  visualRationale: string;
  recommendedTemplate: SlideTemplate;
  recommendedMood: MoodKey;
  recommendedMotifs: MotifKey[];
  avoidVisuals: string[];
}

export interface AiGenerationTrace {
  provider: "nvidia" | "demo";
  model: string;
  baseURL?: string;
  generatedAt: number;
  usedRecommendedTemplate: boolean;
  selectedTemplate: SlideTemplate;
  prompt: {
    system: string;
    user: string;
  };
  rawResponse: string;
  repair?: {
    validationError: string;
    prompt: {
      system: string;
      user: string;
    };
    rawResponse?: string;
  };
  notes: string[];
}

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  bullets: string[];
  verse?: string;
  reference?: string;
  speakerNote: string;
  visualHint: string;
  layout?: SlideLayout;
  highlight?: boolean;
  backgroundImage?: string;
  motif?: MotifKey;
  motifTreatment?: MotifTreatment;
  mood?: MoodKey;
  rhetoricalRole?: RhetoricalRole;
  visualRole?: VisualRole;
  visualDirection?: VisualDirection;
}

export interface SlideDeck {
  id: string;
  createdAt: number;
  title: string;
  summary: string;
  estimatedDurationMinutes: number;
  template: SlideTemplate;
  displayMode: DisplayMode;
  source: "ai" | "demo";
  series?: string;
  preacher?: string;
  motifs?: MotifKey[];
  mood?: MoodKey;
  creativeDirection?: CreativeDirection;
  aiTrace?: AiGenerationTrace;
  accentColor?: string;
  churchName?: string;
  logo?: string;
  slides: Slide[];
  settings: GenerationSettings;
}

export interface GenerationSettings {
  theme?: string;
  series?: string;
  preacher?: string;
  preferredTemplate?: SlideTemplate;
  // Quando true, o usuário escolheu o template e o modelo não deve trocá-lo.
  templateLocked?: boolean;
  style: "culto-principal" | "estudo-biblico" | "jovens" | "conferencia";
  density: "direto" | "equilibrado" | "detalhado";
  displayMode: DisplayMode;
  translation?: TranslationKey;
  highlightVerses: boolean;
  generateOperatorNotes: boolean;
  suggestBlocks: boolean;
}
