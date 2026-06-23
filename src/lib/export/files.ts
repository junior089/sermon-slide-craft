import type { SlideDeck, Slide } from "@/types/slides";

const TYPE_LABEL: Record<Slide["type"], string> = {
  title: "Título",
  topic: "Tópico",
  verse: "Versículo",
  reflection: "Reflexão",
  application: "Aplicação",
  conclusion: "Conclusão",
};

export function deckToScript(deck: SlideDeck): string {
  const lines: string[] = [];
  lines.push(`# ${deck.title}`);
  if (deck.summary) lines.push(`\n${deck.summary}\n`);
  if (deck.series) lines.push(`Série: ${deck.series}`);
  if (deck.preacher) lines.push(`Pregador: ${deck.preacher}`);
  lines.push(`Duração estimada: ~${deck.estimatedDurationMinutes} min`);
  lines.push("");
  deck.slides.forEach((s, i) => {
    lines.push(`Slide ${i + 1} — ${s.title}  [${TYPE_LABEL[s.type]}]`);
    if (s.subtitle) lines.push(`  ${s.subtitle}`);
    s.bullets.forEach((b) => lines.push(`  • ${b}`));
    if (s.verse) lines.push(`  Texto: ${s.verse}${s.reference ? ` (${s.reference})` : ""}`);
    if (s.speakerNote) lines.push(`  Nota do operador: ${s.speakerNote}`);
    lines.push("");
  });
  return lines.join("\n");
}

export function downloadFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  downloadBlob(filename, blob);
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function dataUrlToBlob(dataUrl: string) {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/data:(.*);base64/)?.[1] ?? "application/octet-stream";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export function copyToClipboard(text: string) {
  if (navigator?.clipboard) return navigator.clipboard.writeText(text);
  return Promise.reject(new Error("Clipboard indisponível"));
}

export function getTypeLabel(t: Slide["type"]) {
  return TYPE_LABEL[t];
}

export function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "visio-divina"
  );
}
