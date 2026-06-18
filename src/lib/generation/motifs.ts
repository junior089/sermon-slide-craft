// Vocabulário fechado: o modelo só escolhe chaves desta lista e uma chave
// desconhecida resulta em nenhum motivo. Os SVGs usam currentColor e por isso
// herdam a cor de acento do template.

export type MotifKey =
  | "pao"
  | "peixe"
  | "mar"
  | "ondas"
  | "fogo"
  | "luz"
  | "trigo"
  | "videira"
  | "pomba"
  | "coroa"
  | "cruz"
  | "monte"
  | "tempestade"
  | "ancora"
  | "semente"
  | "caminho"
  | "agua"
  | "lampada"
  | "estrela"
  | "pedra"
  | "deserto"
  | "jardim"
  | "templo"
  | "altar"
  | "mesa"
  | "porta"
  | "veu"
  | "cordeiro"
  | "oleo"
  | "rio"
  | "cidade"
  | "muralha"
  | "vale"
  | "pastor"
  | "ovelha"
  | "escudo"
  | "espada"
  | "coracao"
  | "mente";

export type MotifTreatment = "watermark" | "horizon" | "ornament" | "texture";

export interface MotifMeta {
  key: MotifKey;
  label: string;
  keywords: string[];
  treatment: MotifTreatment;
  // viewBox 0 0 100 100; fill e stroke vêm do CSS (.s-motif-svg).
  svg: string;
}

const REGISTRY: Record<MotifKey, MotifMeta> = {
  pao: {
    key: "pao",
    label: "Pão",
    keywords: ["pao", "paes", "multiplicacao", "alimento", "fome", "ceia", "ferment"],
    treatment: "watermark",
    svg: `<path d="M12 64c0-20 18-32 38-32s38 12 38 32a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6Z"/><path d="M40 40l-7 24M56 38l-7 26M72 42l-7 22"/>`,
  },
  peixe: {
    key: "peixe",
    label: "Peixe",
    keywords: ["peixe", "peixes", "pescar", "pesca", "rede", "pescador", "multiplicacao"],
    treatment: "watermark",
    svg: `<path d="M14 50c14-18 44-18 58 0-14 18-44 18-58 0Z"/><path d="M72 50l16-12v24z"/><circle cx="30" cy="46" r="2.5"/>`,
  },
  mar: {
    key: "mar",
    label: "Mar",
    keywords: ["mar", "oceano", "barco", "galileia", "tempestade", "agua", "aguas", "andar sobre"],
    treatment: "horizon",
    svg: `<path d="M4 50q12-12 24 0t24 0 24 0 24 0"/><path d="M4 66q12-12 24 0t24 0 24 0 24 0"/>`,
  },
  ondas: {
    key: "ondas",
    label: "Ondas",
    keywords: ["onda", "ondas", "mar", "marola", "agua", "aguas", "correnteza"],
    treatment: "horizon",
    svg: `<path d="M4 48q11-12 22 0t22 0 22 0 22 0"/><path d="M4 62q11-12 22 0t22 0 22 0 22 0"/><path d="M4 76q11-12 22 0t22 0 22 0 22 0"/>`,
  },
  fogo: {
    key: "fogo",
    label: "Fogo",
    keywords: [
      "fogo",
      "fornalha",
      "chama",
      "chamas",
      "queima",
      "espirito",
      "lingua de fogo",
      "brasa",
    ],
    treatment: "watermark",
    svg: `<path d="M50 14c10 14 22 22 22 38a22 22 0 1 1-44 0c0-8 4-14 8-18 2 6 6 8 10 8-4-10 0-20 4-28Z"/>`,
  },
  luz: {
    key: "luz",
    label: "Luz",
    keywords: ["luz", "claridade", "brilho", "resplend", "amanhecer", "alvorada", "sol", "glor"],
    treatment: "ornament",
    svg: `<circle cx="50" cy="50" r="13"/><path d="M50 18v-10M50 92v-10M18 50h-10M92 50h-10M28 28l-7-7M79 79l-7-7M72 28l7-7M21 79l7-7"/>`,
  },
  trigo: {
    key: "trigo",
    label: "Trigo",
    keywords: ["trigo", "seara", "colheita", "campo", "semeador", "joio", "celeiro", "espiga"],
    treatment: "watermark",
    svg: `<path d="M50 90V34"/><path d="M50 50c-9-3-14-11-12-20 9 1 14 9 12 20Z"/><path d="M50 50c9-3 14-11 12-20-9 1-14 9-12 20Z"/><path d="M50 40c-8-3-12-10-11-18 8 1 12 8 11 18Z"/><path d="M50 40c8-3 12-10 11-18-8 1-12 8-11 18Z"/>`,
  },
  videira: {
    key: "videira",
    label: "Videira",
    keywords: ["videira", "vinha", "ramo", "ramos", "uva", "uvas", "fruto", "permanecer"],
    treatment: "watermark",
    svg: `<path d="M16 84c22 2 32-14 34-32 2 18 12 30 34 30"/><circle cx="74" cy="40" r="5"/><circle cx="64" cy="34" r="5"/><circle cx="70" cy="50" r="5"/>`,
  },
  pomba: {
    key: "pomba",
    label: "Pomba",
    keywords: [
      "pomba",
      "espirito santo",
      "paz",
      "batismo",
      "noe",
      "diluvio",
      "alianca",
      "oliveira",
    ],
    treatment: "watermark",
    svg: `<path d="M20 60c16 8 34 4 44-10 7-10 7-22 2-30-2 11-11 17-21 17-13 0-23 9-25 23Z"/><path d="M66 17l9 13-15-1"/>`,
  },
  coroa: {
    key: "coroa",
    label: "Coroa",
    keywords: ["coroa", "rei", "reino", "reinar", "trono", "majestade", "galardao", "vencedor"],
    treatment: "ornament",
    svg: `<path d="M20 70h60l6-34-20 14-16-26-16 26-20-14 6 34Z"/><path d="M20 70h60"/>`,
  },
  cruz: {
    key: "cruz",
    label: "Cruz",
    keywords: ["cruz", "calvario", "crucific", "sacrificio", "redencao", "golgota", "madeiro"],
    treatment: "watermark",
    svg: `<path d="M44 14h12v24h24v12H56v40H44V50H20V38h24z"/>`,
  },
  monte: {
    key: "monte",
    label: "Monte",
    keywords: ["monte", "montanha", "alto", "sinai", "siao", "sermao do monte", "subir"],
    treatment: "horizon",
    svg: `<path d="M4 80l28-42 18 26 14-20 32 36z"/><path d="M28 44l4-6 6 8"/>`,
  },
  tempestade: {
    key: "tempestade",
    label: "Tempestade",
    keywords: ["tempestade", "tormenta", "vendaval", "trovao", "raio", "nuvem", "vento"],
    treatment: "watermark",
    svg: `<path d="M30 50a14 14 0 0 1 0-28 18 18 0 0 1 34-2 12 12 0 0 1 4 30z"/><path d="M52 56l-9 16h9l-7 16 18-22h-10l6-10z"/>`,
  },
  ancora: {
    key: "ancora",
    label: "Âncora",
    keywords: ["ancora", "firmeza", "esperanca", "seguranca", "porto", "estavel"],
    treatment: "ornament",
    svg: `<circle cx="50" cy="20" r="7"/><path d="M50 27v50M32 62c0 13 8 20 18 20s18-7 18-20M34 42h32"/>`,
  },
  semente: {
    key: "semente",
    label: "Semente",
    keywords: ["semente", "semear", "plantar", "broto", "crescer", "raiz", "fruto", "germinar"],
    treatment: "ornament",
    svg: `<path d="M50 88V50"/><path d="M50 56c-12 0-20-8-22-20 12 0 20 8 22 20Z"/><path d="M50 50c10-2 16-10 16-22-10 2-16 10-16 22Z"/>`,
  },
  caminho: {
    key: "caminho",
    label: "Caminho",
    keywords: ["caminho", "jornada", "estrada", "vereda", "andar", "seguir", "passos", "rumo"],
    treatment: "horizon",
    svg: `<path d="M36 86l9-46h10l9 46"/><path d="M48 72h4M47 60h6M46 50h8M48 84h4"/>`,
  },
  agua: {
    key: "agua",
    label: "Água viva",
    keywords: ["agua", "aguas", "sede", "fonte", "rio", "poco", "agua viva", "batismo"],
    treatment: "watermark",
    svg: `<path d="M50 16c12 18 20 28 20 40a20 20 0 1 1-40 0c0-12 8-22 20-40Z"/>`,
  },
  lampada: {
    key: "lampada",
    label: "Lâmpada",
    keywords: ["lampada", "candeia", "azeite", "virgens", "vigiar", "preparar", "candelabro"],
    treatment: "ornament",
    svg: `<path d="M24 60c0-9 11-13 26-13h24c6 0 9 5 4 9l-10 6c-5 3-12 5-24 5-12 0-20-3-20-7Z"/><path d="M78 56l9-12c2 6 0 11-9 12z"/>`,
  },
  estrela: {
    key: "estrela",
    label: "Estrela",
    keywords: ["estrela", "belem", "magos", "promessa", "descendencia", "ceu", "natal"],
    treatment: "ornament",
    svg: `<path d="M50 12l10 26 28 1-22 17 8 27-24-15-24 15 8-27-22-17 28-1z"/>`,
  },
  pedra: {
    key: "pedra",
    label: "Rocha",
    keywords: ["pedra", "rocha", "alicerce", "fundamento", "firme", "angular", "construir"],
    treatment: "watermark",
    svg: `<path d="M16 74l11-28 19-9 23 7 13 23-6 13H20z"/><path d="M27 46l19 12 31-15M46 58v22"/>`,
  },
  deserto: {
    key: "deserto",
    label: "Deserto",
    keywords: ["deserto", "ermo", "seco", "sequidao", "prova", "tentacao", "peregrin"],
    treatment: "horizon",
    svg: `<path d="M4 76c20-16 40-16 60 0 10 8 20 8 32 0"/><path d="M18 62c14-8 28-8 42 0M68 54c9-5 18-5 27 0"/><path d="M76 34v28M66 44h20"/>`,
  },
  jardim: {
    key: "jardim",
    label: "Jardim",
    keywords: ["jardim", "eden", "getsemani", "plantio", "florescer", "cultivar", "frutificar"],
    treatment: "ornament",
    svg: `<path d="M50 86V46"/><path d="M50 50c-14-2-23-12-24-27 14 1 23 11 24 27Z"/><path d="M50 48c14-2 23-12 24-27-14 1-23 11-24 27Z"/><path d="M28 86h44"/>`,
  },
  templo: {
    key: "templo",
    label: "Templo",
    keywords: ["templo", "santuario", "casa de deus", "morada", "habitacao", "coluna"],
    treatment: "watermark",
    svg: `<path d="M14 84h72M22 76h56M28 38v38M44 38v38M60 38v38M76 38v38M18 38h64L50 16z"/>`,
  },
  altar: {
    key: "altar",
    label: "Altar",
    keywords: ["altar", "sacrificio", "oferta", "entrega", "holocausto", "consagracao"],
    treatment: "watermark",
    svg: `<path d="M24 66h52l-6 18H30z"/><path d="M32 54h36v12H32z"/><path d="M50 16c8 10 14 16 14 26a14 14 0 1 1-28 0c0-7 5-13 14-26Z"/>`,
  },
  mesa: {
    key: "mesa",
    label: "Mesa",
    keywords: ["mesa", "ceia", "banquete", "comunhao", "partir o pao", "salmo 23"],
    treatment: "horizon",
    svg: `<path d="M16 48h68M24 48v34M76 48v34M30 36h40c8 0 14 5 14 12H16c0-7 6-12 14-12Z"/>`,
  },
  porta: {
    key: "porta",
    label: "Porta",
    keywords: ["porta", "entrada", "abrir", "fechar", "ovelhas", "caminho", "acesso"],
    treatment: "watermark",
    svg: `<path d="M28 86V18h44v68"/><path d="M40 86V30h20v56"/><circle cx="54" cy="58" r="2"/>`,
  },
  veu: {
    key: "veu",
    label: "Véu",
    keywords: ["veu", "rasgou", "santo dos santos", "acesso", "separacao", "cortina"],
    treatment: "texture",
    svg: `<path d="M30 12c10 18 10 35 0 52s-10 28 0 24M50 12c10 18 10 35 0 52s-10 28 0 24M70 12c10 18 10 35 0 52s-10 28 0 24"/><path d="M22 12h56M22 88h56"/>`,
  },
  cordeiro: {
    key: "cordeiro",
    label: "Cordeiro",
    keywords: ["cordeiro", "ovelha", "sacrificio", "pascoa", "imolado", "redencao"],
    treatment: "watermark",
    svg: `<path d="M28 60c-10 0-16-7-16-16s8-16 18-12c5-9 20-12 31-4 12-2 24 6 24 19 0 12-9 21-22 21H34"/><path d="M34 68v14M64 68v14M76 48h10"/>`,
  },
  oleo: {
    key: "oleo",
    label: "Óleo",
    keywords: ["oleo", "azeite", "uncao", "ungir", "vaso", "lampada", "preparacao"],
    treatment: "ornament",
    svg: `<path d="M38 22h24l-4 22c10 8 16 18 16 28a24 24 0 1 1-48 0c0-10 6-20 16-28z"/><path d="M50 52c7 10 11 16 11 23a11 11 0 1 1-22 0c0-7 4-13 11-23Z"/>`,
  },
  rio: {
    key: "rio",
    label: "Rio",
    keywords: ["rio", "rios", "corrente", "ribeiro", "aguas vivas", "ezequiel", "apocalipse"],
    treatment: "horizon",
    svg: `<path d="M8 30c18 12 28 12 44 0s28-12 40 0"/><path d="M8 50c18 12 28 12 44 0s28-12 40 0"/><path d="M8 70c18 12 28 12 44 0s28-12 40 0"/>`,
  },
  cidade: {
    key: "cidade",
    label: "Cidade",
    keywords: ["cidade", "jerusalem", "siao", "nova jerusalem", "muros", "portoes"],
    treatment: "horizon",
    svg: `<path d="M12 78h76M18 78V42h14v36M40 78V28h20v50M68 78V48h14v30M24 42V30M76 48V36"/>`,
  },
  muralha: {
    key: "muralha",
    label: "Muralha",
    keywords: ["muralha", "muro", "jerico", "neemias", "reconstruir", "brecha"],
    treatment: "horizon",
    svg: `<path d="M10 76h80V38H10z"/><path d="M10 50h80M22 38v12M38 50v26M54 38v12M70 50v26M18 38v-8h14v8M48 38v-8h14v8M78 38v-8h12"/>`,
  },
  vale: {
    key: "vale",
    label: "Vale",
    keywords: ["vale", "sombra", "ossos secos", "baixo", "profundo", "atravessar"],
    treatment: "horizon",
    svg: `<path d="M4 80l26-42 20 30 20-30 26 42z"/><path d="M34 72c10-8 22-8 32 0"/>`,
  },
  pastor: {
    key: "pastor",
    label: "Pastor",
    keywords: ["pastor", "pastoreia", "cajado", "guia", "salmo 23", "bom pastor"],
    treatment: "ornament",
    svg: `<path d="M50 88V24c0-10 8-16 17-12 8 4 8 16-1 20-5 2-10 0-13-4"/><path d="M34 88h32"/>`,
  },
  ovelha: {
    key: "ovelha",
    label: "Ovelha",
    keywords: ["ovelha", "ovelhas", "rebanho", "perdida", "apascentar", "pastor"],
    treatment: "watermark",
    svg: `<path d="M28 58c-9 0-16-7-16-15s8-16 18-12c6-10 24-10 30 0 11-3 22 5 22 17 0 11-9 20-22 20H32"/><path d="M34 68v12M62 68v12"/>`,
  },
  escudo: {
    key: "escudo",
    label: "Escudo",
    keywords: ["escudo", "proteção", "protecao", "defesa", "refugio", "fortaleza", "armadura"],
    treatment: "watermark",
    svg: `<path d="M50 10l32 12v24c0 22-13 36-32 44-19-8-32-22-32-44V22z"/><path d="M50 18v62"/>`,
  },
  espada: {
    key: "espada",
    label: "Espada",
    keywords: ["espada", "palavra de deus", "armadura", "batalha", "combate", "guerra"],
    treatment: "watermark",
    svg: `<path d="M72 12L42 58l-8 8 8 8 8-8z"/><path d="M28 72l-12 12M28 58l14 14M20 64l16 16"/>`,
  },
  coracao: {
    key: "coracao",
    label: "Coração",
    keywords: ["coracao", "coração", "alma", "amor", "desejo", "interior", "quebrant"],
    treatment: "watermark",
    svg: `<path d="M50 82S18 62 18 38c0-12 9-20 20-20 6 0 10 3 12 8 2-5 6-8 12-8 11 0 20 8 20 20 0 24-32 44-32 44Z"/>`,
  },
  mente: {
    key: "mente",
    label: "Mente",
    keywords: [
      "mente",
      "pensamento",
      "pensamentos",
      "raciocinio",
      "renovar",
      "capturar",
      "ansiedade",
    ],
    treatment: "watermark",
    svg: `<path d="M34 74c-12-4-20-14-20-28 0-17 13-30 30-30 18 0 32 13 32 31 0 9-4 16-10 22v13H46V70"/><path d="M34 40c6-8 20-8 26 0M34 54c8 6 20 6 28 0"/>`,
  },
};

export const MOTIF_KEYS = Object.keys(REGISTRY) as MotifKey[];

export const MOTIF_TREATMENTS: MotifTreatment[] = ["watermark", "horizon", "ornament", "texture"];

export function isMotifKey(value: unknown): value is MotifKey {
  return typeof value === "string" && value in REGISTRY;
}

export function getMotif(key: MotifKey): MotifMeta {
  return REGISTRY[key];
}

export const MOTIFS: MotifMeta[] = MOTIF_KEYS.map((k) => REGISTRY[k]);

export const MOTIF_VOCABULARY = MOTIF_KEYS.join(", ");

function deaccent(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Casa só no início de palavra para manter radicais como "ferment" (fermento)
// sem pegar "mar" dentro de "amar".
function countWord(haystack: string, needle: string): number {
  if (!needle) return 0;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (haystack.match(new RegExp(`\\b${escaped}`, "g")) || []).length;
}

export function detectMotifs(text: string, limit = 2): MotifKey[] {
  const haystack = deaccent(text);
  const scored: { key: MotifKey; score: number }[] = [];

  for (const meta of MOTIFS) {
    let score = 0;
    for (const kw of meta.keywords) {
      score += countWord(haystack, deaccent(kw));
    }
    if (score > 0) scored.push({ key: meta.key, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.key);
}
