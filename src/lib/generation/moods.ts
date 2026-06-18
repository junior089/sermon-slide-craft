// O tom é aplicado como uma camada translúcida sobre o template e nunca troca
// a cor de acento. Tom ausente ou desconhecido significa nenhuma camada.

export type MoodKey = "solene" | "consolo" | "celebracao" | "ensino" | "adoracao" | "chamada";

export interface MoodMeta {
  key: MoodKey;
  label: string;
  description: string;
  keywords: string[];
}

const REGISTRY: Record<MoodKey, MoodMeta> = {
  solene: {
    key: "solene",
    label: "Solene",
    description: "Juízo, santidade, temor, peso e reverência.",
    keywords: [
      "juizo",
      "santo",
      "santidade",
      "temor",
      "reverencia",
      "gloria",
      "majestade",
      "trono",
      "pecado",
      "arrependimento",
      "cruz",
      "sacrificio",
      "fornalha",
      "ira",
      "justica",
      "eternidade",
      "morte",
    ],
  },
  consolo: {
    key: "consolo",
    label: "Consolo",
    description: "Graça, cura, paz, conforto e cuidado diante da dor.",
    keywords: [
      "consolo",
      "paz",
      "cura",
      "conforto",
      "descanso",
      "graca",
      "perdao",
      "misericordia",
      "cuidado",
      "ansiedade",
      "medo",
      "dor",
      "lagrim",
      "esperanca",
      "abrigo",
      "refugio",
      "ferida",
      "aflicao",
    ],
  },
  celebracao: {
    key: "celebracao",
    label: "Celebração",
    description: "Alegria, gratidão, louvor, vitória e provisão.",
    keywords: [
      "alegria",
      "gratidao",
      "louvor",
      "vitoria",
      "festa",
      "celebrar",
      "gozo",
      "aleluia",
      "agradec",
      "provisao",
      "milagre",
      "multiplicacao",
      "bencao",
      "abundancia",
      "regozij",
    ],
  },
  ensino: {
    key: "ensino",
    label: "Ensino",
    description: "Doutrina, exposição clara, foco (tom neutro).",
    keywords: [
      "ensino",
      "estudo",
      "doutrina",
      "parabola",
      "lei",
      "mandamento",
      "principio",
      "entender",
      "sabedoria",
      "conhecimento",
      "explica",
      "exposicao",
      "verdade",
    ],
  },
  adoracao: {
    key: "adoracao",
    label: "Adoração",
    description: "Intimidade, entrega, presença e comunhão.",
    keywords: [
      "adoracao",
      "adorar",
      "intimidade",
      "presenca",
      "entrega",
      "render",
      "comunhao",
      "oracao",
      "busca",
      "quebrant",
      "altar",
      "santuario",
      "espirito",
    ],
  },
  chamada: {
    key: "chamada",
    label: "Chamada",
    description: "Decisão, urgência, missão e resposta.",
    keywords: [
      "decisao",
      "chamado",
      "resposta",
      "ide",
      "missao",
      "evangelho",
      "arrependei",
      "convite",
      "compromisso",
      "proposito",
      "levante",
      "agir",
      "obediencia",
      "discipulado",
      "enviar",
    ],
  },
};

export const MOOD_KEYS = Object.keys(REGISTRY) as MoodKey[];

export const MOODS: MoodMeta[] = MOOD_KEYS.map((k) => REGISTRY[k]);

export const MOOD_VOCABULARY = MOODS.map((m) => `${m.key} (${m.description})`).join("; ");

export function isMoodKey(value: unknown): value is MoodKey {
  return typeof value === "string" && value in REGISTRY;
}

function deaccent(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Casa só no início de palavra para manter radicais como "lagrim" (lágrimas)
// sem pegar "dor" dentro de "adoração".
function countWord(haystack: string, needle: string): number {
  if (!needle) return 0;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (haystack.match(new RegExp(`\\b${escaped}`, "g")) || []).length;
}

export function detectMood(text: string): MoodKey | undefined {
  const haystack = deaccent(text);
  let best: { key: MoodKey; score: number } | undefined;

  for (const meta of MOODS) {
    let score = 0;
    for (const kw of meta.keywords) {
      score += countWord(haystack, deaccent(kw));
    }
    if (score > 0 && (!best || score > best.score)) best = { key: meta.key, score };
  }

  return best?.key;
}
