import pptxgen from "pptxgenjs";

import type { Slide, SlideDeck, SlideTemplate } from "@/types/slides";
import type { MoodKey } from "@/lib/generation/moods";
import { resolveLayout, maxBulletsFor } from "@/lib/slide-presets";

interface Palette {
  bg: string;
  text: string;
  muted: string;
  accent: string;
}

const PALETTES: Record<SlideTemplate, Palette> = {
  cinematic: { bg: "0B0B0F", text: "FFFFFF", muted: "B8B8C0", accent: "D9B25F" },
  worship: { bg: "171633", text: "FFFFFF", muted: "BDBCE0", accent: "8E7BFF" },
  scripture: { bg: "F6F1E7", text: "23201A", muted: "6B6357", accent: "9A6A2F" },
  bold: { bg: "1A0F0A", text: "FFFFFF", muted: "E0C3B0", accent: "FF7A3D" },
  minimal: { bg: "FFFFFF", text: "1A1A1A", muted: "6B6B6B", accent: "1A1A1A" },
  aurora: { bg: "07201E", text: "FFFFFF", muted: "AEDED4", accent: "3FD8B4" },
  slate: { bg: "16181D", text: "FFFFFF", muted: "AFB4BE", accent: "7FA8FF" },
  dawn: { bg: "FBF3E6", text: "2A2018", muted: "7A6A55", accent: "C8862E" },
  tide: { bg: "08131A", text: "FFFFFF", muted: "9FCBE0", accent: "27D3F5" },
  mono: { bg: "0A0A0A", text: "FFFFFF", muted: "B0B0B0", accent: "FFFFFF" },
  majesty: { bg: "1E0E16", text: "FFFFFF", muted: "D8B6C4", accent: "C2486F" },
  horizon: { bg: "0C1530", text: "FFFFFF", muted: "AFC0E6", accent: "6FA0FF" },
};

// Fontes seguras do PowerPoint, já que as fontes do app não vão embutidas no arquivo.
const TEMPLATE_TYPO: Record<SlideTemplate, { serifTitle: boolean; upper: boolean }> = {
  cinematic: { serifTitle: false, upper: true },
  bold: { serifTitle: false, upper: true },
  tide: { serifTitle: false, upper: true },
  mono: { serifTitle: false, upper: true },
  scripture: { serifTitle: true, upper: false },
  majesty: { serifTitle: true, upper: false },
  worship: { serifTitle: true, upper: false },
  dawn: { serifTitle: true, upper: false },
  aurora: { serifTitle: false, upper: false },
  slate: { serifTitle: false, upper: false },
  minimal: { serifTitle: false, upper: false },
  horizon: { serifTitle: false, upper: false },
};

// transparency 100 é invisível.
const MOOD_TINT: Record<MoodKey, { color: string; transparency: number }> = {
  solene: { color: "000000", transparency: 84 },
  consolo: { color: "FFE8C6", transparency: 88 },
  celebracao: { color: "FFC45C", transparency: 86 },
  adoracao: { color: "7C60E0", transparency: 86 },
  ensino: { color: "FFFFFF", transparency: 100 },
  chamada: { color: "FF7A3D", transparency: 88 },
};

const SERIF_FACE = "Georgia";
const SANS_FACE = "Arial";

function addDivider(s: pptxgen.Slide, accent: string, y: number) {
  // pptxgen.ShapeType é membro de instância, não estático; o nome da forma
  // como string evita depender dele.
  s.addShape("rect", {
    x: W / 2 - 0.45,
    y,
    w: 0.9,
    h: 0.035,
    fill: { color: accent },
    line: { type: "none" },
  });
}

const W = 13.333;
const H = 7.5;
const MX = 0.9;
const CW = W - MX * 2;

export async function deckToPptxBlob(deck: SlideDeck): Promise<Blob> {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = deck.preacher || "Visio Divina";
  pptx.title = deck.title;

  const base = PALETTES[deck.template] ?? PALETTES.cinematic;
  // O pptxgenjs espera hex sem "#".
  const brand = deck.accentColor?.trim().replace(/^#/, "");
  const palette: Palette = brand ? { ...base, accent: brand } : base;
  const maxBullets = maxBulletsFor(deck.displayMode);

  deck.slides.forEach((slide) => {
    const s = pptx.addSlide();
    s.background = { color: palette.bg };
    renderSlide(s, slide, deck, palette, maxBullets);
    if (slide.speakerNote?.trim()) s.addNotes(slide.speakerNote.trim());
  });

  // Com outputType "blob" o retorno é sempre Blob, mas o tipo declarado é uma união.
  return (await pptx.write({ outputType: "blob" })) as Blob;
}

function renderSlide(
  s: pptxgen.Slide,
  slide: Slide,
  deck: SlideDeck,
  p: Palette,
  maxBullets: number,
) {
  const layout = resolveLayout(slide);
  const typo = TEMPLATE_TYPO[deck.template] ?? TEMPLATE_TYPO.cinematic;
  const titleFace = typo.serifTitle ? SERIF_FACE : SANS_FACE;
  const titleSpacing = typo.upper ? -0.5 : 0;
  const tx = (v: string) => (typo.upper ? v.toUpperCase() : v);
  const isHero = layout === "cover" || layout === "closing";

  const tint = deck.mood ? MOOD_TINT[deck.mood] : undefined;
  if (tint && tint.transparency < 100) {
    s.addShape("rect", {
      x: 0,
      y: 0,
      w: W,
      h: H,
      fill: { color: tint.color, transparency: tint.transparency },
      line: { type: "none" },
    });
  }

  const kicker = isHero ? "" : deck.series?.trim() || deck.title?.trim() || "";
  if (kicker) {
    s.addText(kicker.toUpperCase(), {
      x: MX,
      y: 0.5,
      w: CW,
      h: 0.4,
      fontFace: SANS_FACE,
      fontSize: 12,
      color: p.accent,
      charSpacing: 3,
      bold: true,
      align: layout === "points" ? "left" : "center",
    });
  }

  switch (layout) {
    case "scripture":
      s.addText(slide.verse || slide.title, {
        x: MX,
        y: 2.0,
        w: CW,
        h: 3.0,
        fontFace: SERIF_FACE,
        fontSize: 32,
        italic: true,
        color: p.text,
        align: "center",
        valign: "middle",
      });
      s.addText((slide.reference || slide.title).toUpperCase(), {
        x: MX,
        y: 5.2,
        w: CW,
        h: 0.6,
        fontFace: SANS_FACE,
        fontSize: 18,
        color: p.accent,
        align: "center",
        bold: true,
        charSpacing: 2,
      });
      break;

    case "quote":
      s.addText(slide.verse || slide.title, {
        x: MX,
        y: 2.2,
        w: CW,
        h: 2.6,
        fontFace: SERIF_FACE,
        fontSize: 30,
        italic: true,
        color: p.text,
        align: "center",
        valign: "middle",
      });
      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: MX,
          y: 5.0,
          w: CW,
          h: 0.6,
          fontFace: SANS_FACE,
          fontSize: 18,
          color: p.muted,
          align: "center",
        });
      }
      break;

    case "points": {
      s.addText(tx(slide.title), {
        x: MX,
        y: 1.3,
        w: CW,
        h: 1.2,
        fontFace: titleFace,
        fontSize: 40,
        bold: true,
        charSpacing: titleSpacing,
        color: p.text,
      });
      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: MX,
          y: 2.5,
          w: CW,
          h: 0.6,
          fontFace: SANS_FACE,
          fontSize: 20,
          color: p.muted,
        });
      }
      const bullets = slide.bullets.slice(0, maxBullets);
      if (bullets.length > 0) {
        s.addText(
          bullets.map((b) => ({
            text: b,
            options: { bullet: { code: "2022", indent: 18 }, breakLine: true },
          })),
          {
            x: MX,
            y: 3.3,
            w: CW,
            h: 3.4,
            fontFace: SANS_FACE,
            fontSize: 24,
            color: p.text,
            valign: "top",
            lineSpacingMultiple: 1.3,
          },
        );
      }
      break;
    }

    case "statement":
      addDivider(s, p.accent, 1.7);
      s.addText(tx(slide.title), {
        x: MX,
        y: 2.2,
        w: CW,
        h: 2.6,
        fontFace: titleFace,
        fontSize: 48,
        bold: true,
        charSpacing: titleSpacing,
        color: p.text,
        align: "center",
        valign: "middle",
      });
      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: MX,
          y: 5.0,
          w: CW,
          h: 0.7,
          fontFace: SANS_FACE,
          fontSize: 22,
          color: p.muted,
          align: "center",
        });
      }
      break;

    case "cover":
    case "closing":
    default: {
      addDivider(s, p.accent, 2.0);
      s.addText(tx(slide.title), {
        x: MX,
        y: 2.4,
        w: CW,
        h: 1.8,
        fontFace: titleFace,
        fontSize: layout === "cover" ? 54 : 46,
        bold: true,
        charSpacing: titleSpacing,
        color: p.text,
        align: "center",
        valign: "middle",
      });
      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: MX,
          y: 4.3,
          w: CW,
          h: 0.7,
          fontFace: SANS_FACE,
          fontSize: 22,
          color: p.muted,
          align: "center",
        });
      }
      const meta = [deck.series, deck.preacher].filter(Boolean).join("  ·  ");
      if (meta) {
        s.addText(meta, {
          x: MX,
          y: 6.4,
          w: CW,
          h: 0.5,
          fontFace: SANS_FACE,
          fontSize: 16,
          color: p.muted,
          align: "center",
          charSpacing: 1,
        });
      }
      break;
    }
  }
}
