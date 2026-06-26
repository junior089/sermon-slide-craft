import { maxBulletsFor } from "@/lib/slide-presets";
import type { DisplayMode, Slide } from "@/types/slides";

export interface ReviewItem {
  type: "ok" | "warn";
  text: string;
}

// Títulos que serviriam para qualquer pregação e pedem reescrita.
const GENERIC_TITLES = new Set([
  "ponto",
  "pontos",
  "ponto principal",
  "primeiro ponto",
  "segundo ponto",
  "terceiro ponto",
  "aplicacao",
  "aplicacao pratica",
  "introducao",
  "conclusao",
  "desenvolvimento",
  "reflexao",
  "topico",
  "topicos",
  "mensagem",
  "tema",
  "ideia central",
  "ideia principal",
  "consideracoes finais",
]);

function deaccentLower(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isGenericTitle(title: string): boolean {
  const normalized = deaccentLower(title);
  if (!normalized) return false;
  if (GENERIC_TITLES.has(normalized)) return true;
  return /^(ponto|aplicacao|parte)\s+\d+$/.test(normalized);
}

export function reviewSlide(slide: Slide, displayMode: DisplayMode): ReviewItem[] {
  const maxBullets = maxBulletsFor(displayMode);
  const issues: ReviewItem[] = [];

  if (slide.title.trim().length < 3 && !slide.verse?.trim()) {
    issues.push({ type: "warn", text: "Adicione um título ou texto bíblico antes de apresentar." });
  }
  if ((slide.layout === "points" || slide.layout === "statement") && isGenericTitle(slide.title)) {
    issues.push({
      type: "warn",
      text: "Título genérico: reescreva com o vocabulário específico desta mensagem.",
    });
  }
  if (slide.title.length > 62) {
    issues.push({
      type: "warn",
      text: "Título longo para telão; considere quebrar em dois slides.",
    });
  }
  if (slide.bullets.length > maxBullets) {
    issues.push({
      type: "warn",
      text: `Este modo exibe até ${maxBullets} tópicos; os demais ficam ocultos no slide.`,
    });
  }
  if (slide.verse?.trim() && !slide.reference?.trim()) {
    issues.push({ type: "warn", text: "Texto bíblico sem referência." });
  }
  if (!slide.speakerNote.trim()) {
    issues.push({ type: "warn", text: "Sem nota para o operador de mídia." });
  }

  if (issues.length === 0) {
    return [{ type: "ok", text: "Slide pronto para revisão final." }];
  }
  return issues;
}

// Imagens de outra origem contaminam o canvas e fazem a exportação em PNG falhar.
export function validateBackgroundImage(value?: string): string | null {
  const url = value?.trim();
  if (!url) return null;
  if (url.startsWith("data:image/")) return null;

  let parsed: URL;
  try {
    parsed = new URL(url, typeof window !== "undefined" ? window.location.href : "http://local");
  } catch {
    return "URL inválida. Use um endereço https:// ou um data:image.";
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return "Use uma URL https:// ou um data:image.";
  }
  if (typeof window !== "undefined" && parsed.origin !== window.location.origin) {
    return "Imagem de outra origem pode não aparecer na exportação em PNG (restrição de CORS).";
  }
  return null;
}
