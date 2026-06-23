import { toJpeg, toPng } from "html-to-image";
import JSZip from "jszip";

import { dataUrlToBlob, deckToScript, getTypeLabel } from "@/lib/export/files";
import type { SlideDeck } from "@/types/slides";

// O slide é composto sobre esta base e a saída é a base vezes o fator de
// qualidade. O layout é idêntico em qualquer resolução; muda só a nitidez.
export const EXPORT_WIDTH = 1920;
export const EXPORT_HEIGHT = 1080;

const RENDER_TIMEOUT_MS = 25_000;

export interface ResolutionPreset {
  id: string;
  label: string;
  short: string;
  pixelRatio: number;
}

// 4K por padrão: fica nítido em telões 1080p, que reduzem a imagem com
// qualidade, e já serve para painéis 4K.
export const RESOLUTIONS: ResolutionPreset[] = [
  { id: "uhd", label: "4K · 3840×2160 (máxima qualidade)", short: "4K", pixelRatio: 2 },
  { id: "fhd", label: "Full HD · 1920×1080", short: "1080p", pixelRatio: 1 },
  { id: "hd", label: "HD · 1280×720", short: "720p", pixelRatio: 2 / 3 },
];

export function outputSize(resolution: ResolutionPreset) {
  return {
    width: Math.round(EXPORT_WIDTH * resolution.pixelRatio),
    height: Math.round(EXPORT_HEIGHT * resolution.pixelRatio),
  };
}

// PNG sem perdas para o ZIP; JPEG para o PDF, que fica muito menor.
export async function renderSlidesToDataUrls(
  nodes: Array<HTMLElement | null>,
  format: "png" | "jpeg",
  pixelRatio: number,
  onProgress: (done: number) => void,
): Promise<string[]> {
  await waitForExportReady();
  const options = {
    backgroundColor: "#000000",
    cacheBust: true,
    pixelRatio,
    width: EXPORT_WIDTH,
    height: EXPORT_HEIGHT,
    canvasWidth: EXPORT_WIDTH,
    canvasHeight: EXPORT_HEIGHT,
  };
  const urls: string[] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    if (!node) throw new Error(`Slide ${i + 1} não está pronto para exportação.`);
    // Uma imagem de fundo de outra origem pode travar o html-to-image para
    // sempre; com o timeout o usuário recebe um erro claro.
    const dataUrl = await withTimeout(
      format === "jpeg" ? toJpeg(node, { ...options, quality: 0.92 }) : toPng(node, options),
      RENDER_TIMEOUT_MS,
      `Tempo esgotado ao renderizar o slide ${i + 1}. Verifique imagens de fundo de outra origem.`,
    );
    urls.push(dataUrl);
    onProgress(i + 1);
  }
  return urls;
}

export async function buildImagesZip(
  deck: SlideDeck,
  pngUrls: string[],
  resolution: ResolutionPreset,
): Promise<Blob> {
  const zip = new JSZip();
  const imageFolder = zip.folder("slides") ?? zip;
  const pad = String(pngUrls.length).length;
  pngUrls.forEach((url, i) => {
    imageFolder.file(`slide-${String(i + 1).padStart(pad, "0")}.png`, dataUrlToBlob(url));
  });
  zip.file("LEIA-ME.txt", buildManifest(deck, resolution, pad));
  zip.file("roteiro.txt", deckToScript(deck));
  zip.file("apresentacao.json", JSON.stringify(deck, null, 2));
  return zip.generateAsync({ type: "blob" });
}

// Orienta quem importa os arquivos em softwares de projeção sobre a ordem e o
// conteúdo de cada slide.
function buildManifest(deck: SlideDeck, resolution: ResolutionPreset, pad: number): string {
  const { width, height } = outputSize(resolution);
  const lines: string[] = [];
  lines.push("Visio Divina — pacote de slides");
  lines.push(`Título: ${deck.title}`);
  if (deck.series) lines.push(`Série: ${deck.series}`);
  if (deck.preacher) lines.push(`Pregador: ${deck.preacher}`);
  lines.push(`Resolução: ${width}×${height} (${resolution.short})`);
  lines.push(`Total: ${deck.slides.length} slides`);
  lines.push(`Gerado em: ${new Date().toLocaleString("pt-BR")}`);
  lines.push("");
  lines.push('Importe os arquivos da pasta "slides" na ordem numérica abaixo.');
  lines.push("");
  deck.slides.forEach((s, i) => {
    const num = String(i + 1).padStart(pad, "0");
    const ref = s.reference ? ` — ${s.reference}` : "";
    lines.push(`${num}  [${getTypeLabel(s.type)}]  ${s.title}${ref}`);
  });
  lines.push("");
  return lines.join("\n");
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)) as Promise<T>;
}

async function waitForExportReady() {
  await document.fonts?.ready;
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

  const images = Array.from(document.images).filter((img) => !img.complete);
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  );
}
