import type { SlideDeckResponse } from "@/lib/generation/schemas";
import {
  DEFAULT_TRANSLATION_KEY,
  getTranslationMeta,
  type TranslationKey,
  type TranslationMeta,
} from "@/lib/bible/translations";
import { getServerEnv } from "@/lib/env";

// O texto bíblico vem sempre de uma API, nunca do modelo, para evitar
// paráfrases ou versículos citados de memória com erro.

const FETCH_TIMEOUT_MS = 8000;

// NVI, ARA e ACF têm direitos autorais. Só são servidas quando quem opera o
// servidor declara ter a licença (flag + token); sem isso, o app usa Almeida.
function licensedTranslationsEnabled(): boolean {
  const env = getServerEnv();
  return env.BIBLE_LICENSED_ENABLED && Boolean(env.BIBLE_API_TOKEN);
}

const cache = new Map<string, string>();

const PLACEHOLDER_RE = /…|texto do vers[íi]culo|conforme o roteiro/i;

function effectiveMeta(key?: string): TranslationMeta {
  const meta = getTranslationMeta(key);
  if (!meta.publicDomain && !licensedTranslationsEnabled()) {
    return getTranslationMeta(DEFAULT_TRANSLATION_KEY);
  }
  return meta;
}

function normalizeReference(reference: string): string {
  return reference
    .replace(/(\d)\s*[.:]\s*(\d)/g, "$1:$2")
    .replace(/\s+/g, " ")
    .trim();
}

function deaccent(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Lista de livros (sem acento) usada para descartar falsos positivos como
// "Sala 3:00". O ordinal ("1", "II") é tratado à parte pela regex.
const BOOK_TOKENS = new Set<string>([
  "genesis",
  "gn",
  "gen",
  "exodo",
  "ex",
  "exo",
  "levitico",
  "lv",
  "lev",
  "numeros",
  "nm",
  "num",
  "deuteronomio",
  "dt",
  "deut",
  "josue",
  "js",
  "jos",
  "juizes",
  "jz",
  "juiz",
  "rute",
  "rt",
  "samuel",
  "sm",
  "reis",
  "rs",
  "cronicas",
  "cr",
  "cron",
  "esdras",
  "ed",
  "esd",
  "neemias",
  "ne",
  "nee",
  "ester",
  "et",
  "est",
  "jo",
  "job",
  "salmos",
  "salmo",
  "sl",
  "sal",
  "proverbios",
  "pv",
  "prov",
  "eclesiastes",
  "ec",
  "ecl",
  "cantares",
  "canticos",
  "ct",
  "cant",
  "isaias",
  "is",
  "isa",
  "jeremias",
  "jr",
  "jer",
  "lamentacoes",
  "lm",
  "lam",
  "ezequiel",
  "ez",
  "eze",
  "daniel",
  "dn",
  "dan",
  "oseias",
  "os",
  "ose",
  "joel",
  "jl",
  "amos",
  "am",
  "obadias",
  "ob",
  "jonas",
  "jn",
  "miqueias",
  "mq",
  "naum",
  "na",
  "habacuque",
  "hc",
  "sofonias",
  "sf",
  "ageu",
  "ag",
  "zacarias",
  "zc",
  "malaquias",
  "ml",
  "mateus",
  "mt",
  "mat",
  "marcos",
  "mc",
  "mar",
  "lucas",
  "lc",
  "luc",
  "joao",
  "atos",
  "at",
  "romanos",
  "rm",
  "rom",
  "corintios",
  "co",
  "cor",
  "galatas",
  "gl",
  "gal",
  "efesios",
  "ef",
  "efe",
  "filipenses",
  "fp",
  "fil",
  "colossenses",
  "cl",
  "col",
  "tessalonicenses",
  "ts",
  "tes",
  "timoteo",
  "tm",
  "tim",
  "tito",
  "tt",
  "filemom",
  "fm",
  "hebreus",
  "hb",
  "heb",
  "tiago",
  "tg",
  "pedro",
  "pe",
  "judas",
  "jd",
  "apocalipse",
  "ap",
  "apoc",
]);

// Mantém o nome do livro como foi escrito, porque a bible-api.com entende
// nomes em português, e normaliza só o separador.
export function extractScriptureReferences(text: string, limit = 8): string[] {
  const re =
    /\b((?:[1-3]|i{1,3})\s+)?(\p{L}{2,})\.?\s+(\d{1,3})\s*[:.]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?/giu;

  const found: string[] = [];
  const seen = new Set<string>();

  for (const m of text.matchAll(re)) {
    const ordinal = m[1]?.trim();
    const bookRaw = m[2];
    const bookToken = deaccent(bookRaw);
    if (!BOOK_TOKENS.has(bookToken)) continue;

    const chapter = m[3];
    const verseStart = m[4];
    const verseEnd = m[5];
    const bookDisplay = ordinal ? `${ordinal} ${bookRaw}` : bookRaw;
    const ref = `${bookDisplay} ${chapter}:${verseStart}${verseEnd ? `-${verseEnd}` : ""}`;

    const key = deaccent(ref);
    if (seen.has(key)) continue;
    seen.add(key);
    found.push(ref);
    if (found.length >= limit) break;
  }

  return found;
}

export interface ResolvedScripture {
  reference: string;
  text: string;
}

// Sequencial para respeitar o rate limit da API pública. Nunca lança: uma
// referência não encontrada não pode bloquear a geração.
export async function resolveScriptureTexts(
  references: string[],
  translation: TranslationKey = DEFAULT_TRANSLATION_KEY,
): Promise<ResolvedScripture[]> {
  const out: ResolvedScripture[] = [];
  for (const ref of references) {
    try {
      const text = await fetchVerseText(ref, translation);
      if (text) out.push({ reference: normalizeReference(ref), text });
    } catch {
      continue;
    }
  }
  return out;
}

function hasVerseNumber(reference: string): boolean {
  return /\d+\s*[.:]\s*\d+/.test(reference);
}

function cleanText(text?: string): string {
  return (text || "").replace(/\s+/g, " ").trim();
}

function needsVerseText(verse?: string): boolean {
  const t = cleanText(verse);
  return t.length < 8 || PLACEHOLDER_RE.test(t);
}

const BOOK_ABBREV: Record<string, string> = {
  genesis: "gn",
  exodo: "ex",
  levitico: "lv",
  numeros: "nm",
  deuteronomio: "dt",
  josue: "js",
  juizes: "jz",
  rute: "rt",
  samuel: "sm",
  reis: "rs",
  cronicas: "cr",
  esdras: "ed",
  neemias: "ne",
  ester: "et",
  job: "job",
  salmos: "sl",
  salmo: "sl",
  proverbios: "pv",
  eclesiastes: "ec",
  cantares: "ct",
  canticos: "ct",
  isaias: "is",
  jeremias: "jr",
  lamentacoes: "lm",
  ezequiel: "ez",
  daniel: "dn",
  oseias: "os",
  joel: "jl",
  amos: "am",
  obadias: "ob",
  jonas: "jn",
  miqueias: "mq",
  naum: "na",
  habacuque: "hc",
  sofonias: "sf",
  ageu: "ag",
  zacarias: "zc",
  malaquias: "ml",
  mateus: "mt",
  marcos: "mc",
  lucas: "lc",
  joao: "jo",
  atos: "atos",
  romanos: "rm",
  corintios: "co",
  galatas: "gl",
  efesios: "ef",
  filipenses: "fp",
  colossenses: "cl",
  tessalonicenses: "ts",
  timoteo: "tm",
  tito: "tt",
  filemom: "fm",
  hebreus: "hb",
  tiago: "tg",
  pedro: "pe",
  judas: "jd",
  apocalipse: "ap",
};

interface ReferenceParts {
  abbrev: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
}

function parseReferenceParts(ref: string): ReferenceParts | null {
  const m = ref.match(/^((?:[1-3]|i{1,3})\s+)?(\p{L}{2,})\s+(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/iu);
  if (!m) return null;
  const baseAbbrev = BOOK_ABBREV[deaccent(m[2])];
  if (!baseAbbrev) return null;
  const ord = m[1]?.trim().toLowerCase();
  const ordNum = ord ? (ord === "i" ? "1" : ord === "ii" ? "2" : ord === "iii" ? "3" : ord) : "";
  return {
    abbrev: ordNum ? `${ordNum}${baseAbbrev}` : baseAbbrev,
    chapter: Number(m[3]),
    verseStart: Number(m[4]),
    verseEnd: m[5] ? Number(m[5]) : undefined,
  };
}

async function fetchJson(url: string, headers: Record<string, string>): Promise<unknown | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "VisioDivina/1.0", Accept: "application/json", ...headers },
    });
    // A API pública às vezes responde HTML com status 200 quando aplica rate limit.
    if (!res.ok || !res.headers.get("content-type")?.includes("json")) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function requestVerseBibleApi(ref: string, apiId: string): Promise<string | null> {
  const url = `${getServerEnv().BIBLE_API_URL}/${encodeURIComponent(ref)}?translation=${encodeURIComponent(apiId)}`;
  const json = (await fetchJson(url, {})) as { text?: string } | null;
  return json ? cleanText(json.text) || null : null;
}

// A abibliadigital devolve um versículo por chamada; intervalos são montados
// buscando cada versículo.
async function requestVerseAbiblia(ref: string, version: string): Promise<string | null> {
  const parsed = parseReferenceParts(ref);
  if (!parsed) return null;
  const { abbrev, chapter, verseStart, verseEnd } = parsed;

  const { ABIBLIA_API_URL, BIBLE_API_TOKEN } = getServerEnv();
  const end = verseEnd && verseEnd >= verseStart ? Math.min(verseEnd, verseStart + 20) : verseStart;
  const parts: string[] = [];
  for (let v = verseStart; v <= end; v++) {
    const url = `${ABIBLIA_API_URL}/verses/${encodeURIComponent(version)}/${abbrev}/${chapter}/${v}`;
    const json = (await fetchJson(url, { Authorization: `Bearer ${BIBLE_API_TOKEN ?? ""}` })) as {
      text?: string;
    } | null;
    const text = json ? cleanText(json.text) : "";
    if (text) parts.push(text);
  }
  return parts.length ? parts.join(" ") : null;
}

export async function fetchVerseText(
  reference: string,
  translation: TranslationKey = DEFAULT_TRANSLATION_KEY,
): Promise<string | null> {
  const ref = normalizeReference(reference);
  if (!ref || !hasVerseNumber(ref)) return null;

  const meta = effectiveMeta(translation);
  const cacheKey = `${meta.key}|${ref}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const request = () =>
    meta.provider === "abibliadigital"
      ? requestVerseAbiblia(ref, meta.apiId)
      : requestVerseBibleApi(ref, meta.apiId);

  // A API pública falha de forma intermitente; uma segunda tentativa costuma resolver.
  let value = await request();
  if (!value) {
    await new Promise((r) => setTimeout(r, 400));
    value = await request();
  }
  if (value) cache.set(cacheKey, value);
  return value;
}

export async function enrichDeckVerses(
  deck: SlideDeckResponse,
  translation: TranslationKey = DEFAULT_TRANSLATION_KEY,
): Promise<SlideDeckResponse> {
  const targets = deck.slides
    .map((slide, index) => ({ slide, index }))
    .filter(
      ({ slide }) =>
        (slide.layout === "scripture" || slide.type === "verse") &&
        slide.reference &&
        needsVerseText(slide.verse) &&
        hasVerseNumber(slide.reference),
    );

  if (targets.length === 0) return deck;

  const slides = [...deck.slides];
  for (const { slide, index } of targets) {
    const text = await fetchVerseText(slide.reference!, translation);
    if (text) slides[index] = { ...slides[index], verse: text };
  }
  return { ...deck, slides };
}
