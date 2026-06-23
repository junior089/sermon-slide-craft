import { useRef, useState } from "react";
import {
  Copy,
  Download,
  FileArchive,
  FileDown,
  FileJson,
  Loader2,
  Presentation,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlideCanvas } from "@/components/slide-canvas";
import {
  copyToClipboard,
  deckToScript,
  downloadBlob,
  downloadFile,
  slugify,
} from "@/lib/export/files";
import {
  EXPORT_HEIGHT,
  EXPORT_WIDTH,
  RESOLUTIONS,
  buildImagesZip,
  renderSlidesToDataUrls,
} from "@/lib/export/image";
import type { SlideDeck } from "@/types/slides";

type BusyKind = "png" | "pdf" | "pptx" | null;

export function ExportActions({ deck }: { deck: SlideDeck }) {
  const exportRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [busy, setBusy] = useState<BusyKind>(null);
  const [progress, setProgress] = useState(0);
  const [resolutionId, setResolutionId] = useState("uhd");
  const resolution = RESOLUTIONS.find((r) => r.id === resolutionId) ?? RESOLUTIONS[0];
  const deckSlug = slugify(deck.title);
  const total = deck.slides.length;

  function onCopy() {
    copyToClipboard(deckToScript(deck))
      .then(() => toast.success("Roteiro copiado para a área de transferência."))
      .catch(() => toast.error("Não foi possível copiar."));
  }

  function onJson() {
    downloadFile(`${deckSlug}.json`, JSON.stringify(deck, null, 2), "application/json");
  }

  function onTxt() {
    downloadFile(`${deckSlug}.txt`, deckToScript(deck));
  }

  function renderSlides(format: "png" | "jpeg") {
    return renderSlidesToDataUrls(
      exportRefs.current.slice(0, total),
      format,
      resolution.pixelRatio,
      setProgress,
    );
  }

  async function onImagesZip() {
    if (busy) return;
    setBusy("png");
    setProgress(0);
    try {
      const urls = await renderSlides("png");
      const blob = await buildImagesZip(deck, urls, resolution);
      downloadBlob(`${deckSlug}-slides-png.zip`, blob);
      toast.success(`Slides exportados em PNG (${resolution.short}) dentro do ZIP.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao exportar imagens.");
    } finally {
      setBusy(null);
      setProgress(0);
    }
  }

  async function onPdf() {
    if (busy) return;
    setBusy("pdf");
    setProgress(0);
    try {
      const urls = await renderSlides("jpeg");
      const { savePdf } = await import("@/lib/export/pdf");
      await savePdf(urls, `${deckSlug}.pdf`);
      toast.success("PDF gerado com um slide por página.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao gerar o PDF.");
    } finally {
      setBusy(null);
      setProgress(0);
    }
  }

  async function onPptx() {
    if (busy) return;
    setBusy("pptx");
    try {
      const { deckToPptxBlob } = await import("@/lib/export/pptx");
      const blob = await deckToPptxBlob(deck);
      downloadBlob(`${deckSlug}.pptx`, blob);
      toast.success("PPTX editável gerado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao gerar o PPTX.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Imagem</span>
          <Select value={resolutionId} onValueChange={setResolutionId} disabled={!!busy}>
            <SelectTrigger
              className="h-9 w-[150px] bg-background text-xs"
              aria-label="Resolução de exportação"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESOLUTIONS.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={onPptx} disabled={!!busy}>
          {busy === "pptx" ? (
            <Loader2 className="mr-1.5 size-4 animate-spin" />
          ) : (
            <Presentation className="mr-1.5 size-4" />
          )}
          {busy === "pptx" ? "Gerando PPTX" : "Baixar PPTX"}
        </Button>
        <Button variant="outline" size="sm" onClick={onPdf} disabled={!!busy}>
          {busy === "pdf" ? (
            <Loader2 className="mr-1.5 size-4 animate-spin" />
          ) : (
            <FileDown className="mr-1.5 size-4" />
          )}
          {busy === "pdf" ? `PDF ${progress}/${total}` : "Baixar PDF"}
        </Button>
        <Button variant="outline" size="sm" onClick={onImagesZip} disabled={!!busy}>
          {busy === "png" ? (
            <Loader2 className="mr-1.5 size-4 animate-spin" />
          ) : (
            <FileArchive className="mr-1.5 size-4" />
          )}
          {busy === "png" ? `PNG ${progress}/${total}` : "Baixar PNGs .zip"}
        </Button>
        <Button variant="outline" size="sm" onClick={onCopy} disabled={!!busy}>
          <Copy className="mr-1.5 size-4" /> Copiar roteiro
        </Button>
        <Button variant="outline" size="sm" onClick={onTxt} disabled={!!busy}>
          <Download className="mr-1.5 size-4" /> Baixar .txt
        </Button>
        <Button variant="outline" size="sm" onClick={onJson} disabled={!!busy}>
          <FileJson className="mr-1.5 size-4" /> Exportar JSON
        </Button>
      </div>

      <div className="pointer-events-none fixed left-[-10000px] top-0 -z-10" aria-hidden="true">
        {deck.slides.map((slide, index) => (
          <div
            key={slide.id}
            ref={(node) => {
              exportRefs.current[index] = node;
            }}
            style={{ width: EXPORT_WIDTH, height: EXPORT_HEIGHT, background: "#000000" }}
          >
            <SlideCanvas
              slide={slide}
              template={deck.template}
              displayMode={deck.displayMode}
              index={index}
              total={deck.slides.length}
              series={deck.series}
              preacher={deck.preacher}
              messageTitle={deck.title}
              deckMotif={deck.motifs?.[0]}
              deckMood={deck.mood}
              accentColor={deck.accentColor}
              churchName={deck.churchName}
              logo={deck.logo}
              showChrome={false}
            />
          </div>
        ))}
      </div>
    </>
  );
}
