import type { DisplayMode, Slide, SlideTemplate } from "@/types/slides";
import { maxBulletsFor, resolveLayout } from "@/lib/slide-presets";
import { getMotif, isMotifKey, type MotifKey } from "@/lib/generation/motifs";
import { isMoodKey, type MoodKey } from "@/lib/generation/moods";
import { cn } from "@/lib/utils";

interface SlideCanvasProps {
  slide: Slide;
  template: SlideTemplate;
  index: number;
  total: number;
  displayMode?: DisplayMode;
  series?: string;
  preacher?: string;
  messageTitle?: string;
  deckMotif?: MotifKey;
  deckMood?: MoodKey;
  accentColor?: string;
  churchName?: string;
  logo?: string;
  className?: string;
  showChrome?: boolean;
}

export function SlideCanvas({
  slide,
  template,
  index,
  total,
  displayMode = "telao",
  series,
  preacher,
  messageTitle,
  deckMotif,
  deckMood,
  accentColor,
  churchName,
  logo,
  className,
  showChrome = true,
}: SlideCanvasProps) {
  const layout = resolveLayout(slide);
  const maxBullets = maxBulletsFor(displayMode);
  const bullets = slide.bullets.slice(0, maxBullets);
  const reference = slide.reference || (layout === "scripture" ? slide.title : undefined);
  const isHero = layout === "cover" || layout === "closing";

  const showMeta = isHero && (series || preacher);

  // Nos slides de capa e encerramento o topo fica limpo; nos internos, a série
  // ou o título da mensagem dá continuidade, em vez de um rótulo como "TÓPICO".
  const kicker = isHero ? undefined : series?.trim() || messageTitle?.trim() || undefined;

  // O motivo do deck só aparece em capa, encerramento e destaques. Em todos os
  // slides ele viraria enfeite repetitivo.
  const inheritsMotif =
    layout === "cover" ||
    layout === "closing" ||
    layout === "statement" ||
    Boolean(slide.highlight);
  const motifKey: MotifKey | undefined = isMotifKey(slide.motif)
    ? slide.motif
    : isMotifKey(slide.visualDirection?.symbol)
      ? slide.visualDirection.symbol
      : inheritsMotif
        ? deckMotif
        : undefined;
  const motif = motifKey ? getMotif(motifKey) : undefined;
  const motifTreatment =
    slide.motifTreatment ?? slide.visualDirection?.treatment ?? motif?.treatment;

  const mood: MoodKey | undefined = isMoodKey(slide.mood) ? slide.mood : deckMood;

  const atmosphere = slide.visualDirection?.atmosphere;
  const background = slide.visualDirection?.background;
  const visualRole = slide.visualRole;
  const suppressMotif = background === "sem_imagem";
  const showAtmosphere = Boolean(atmosphere) || (background && background !== "sem_imagem");

  const styleVars: Record<string, string> = {};
  if (slide.backgroundImage) styleVars["--s-bg"] = `url(${JSON.stringify(slide.backgroundImage)})`;
  if (accentColor?.trim()) styleVars["--tpl-accent"] = accentColor.trim();

  return (
    <div
      className={cn("slide-canvas", `tpl-${template}`, `mode-${displayMode}`, className)}
      data-layout={layout}
      data-type={slide.type}
      data-highlight={slide.highlight ? "true" : undefined}
      data-mood={mood}
      data-atmosphere={atmosphere}
      data-background={background}
      data-visual-role={visualRole}
      style={Object.keys(styleVars).length ? styleVars : undefined}
    >
      <span className="s-decor" aria-hidden />
      {mood && <span className="s-mood" aria-hidden />}
      {showAtmosphere && <span className="s-atmosphere" aria-hidden />}
      {motif && !suppressMotif && (
        <span
          className="s-motif"
          data-motif={motifKey}
          data-motif-treatment={motifTreatment}
          data-intensity={slide.visualDirection?.intensity}
          aria-hidden
        >
          <svg
            className="s-motif-svg"
            viewBox="0 0 100 100"
            dangerouslySetInnerHTML={{ __html: motif.svg }}
          />
        </span>
      )}
      {slide.backgroundImage && <span className="s-bg" aria-hidden />}

      <span className="s-index" aria-hidden>
        {String(index + 1).padStart(2, "0")}
      </span>

      {showChrome && (
        <div className="s-chrome">
          <span>Visio Divina</span>
          <span>
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      )}

      {isHero && (logo || churchName?.trim()) && (
        <div className="s-brand">
          {logo && <img className="s-brand-logo" src={logo} alt="" aria-hidden />}
          {churchName?.trim() && <span className="s-brand-name">{churchName.trim()}</span>}
        </div>
      )}

      <div className="s-content">
        {kicker && (
          <div className="s-eyebrow">
            <span className="s-kicker">{kicker}</span>
          </div>
        )}
        <span className="s-divider" aria-hidden />

        {renderLayout(layout, slide, bullets, reference)}

        {showMeta && (
          <div className="s-meta">
            {series && <span className="s-meta-series">{series}</span>}
            {preacher && <span className="s-meta-preacher">{preacher}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function renderLayout(
  layout: ReturnType<typeof resolveLayout>,
  slide: Slide,
  bullets: string[],
  reference?: string,
) {
  switch (layout) {
    case "scripture":
      return (
        <>
          {slide.verse && <blockquote className="s-verse">{slide.verse}</blockquote>}
          {reference && <div className="s-ref">{reference}</div>}
        </>
      );

    case "quote":
      return (
        <>
          <blockquote className="s-verse">{slide.verse || slide.title}</blockquote>
          {slide.subtitle && <div className="s-ref">{slide.subtitle}</div>}
        </>
      );

    case "statement":
      return (
        <>
          <div className="s-title">{slide.title}</div>
          {slide.subtitle && <div className="s-subtitle">{slide.subtitle}</div>}
        </>
      );

    case "points":
      return (
        <>
          <div className="s-title">{slide.title}</div>
          {slide.subtitle && <div className="s-subtitle">{slide.subtitle}</div>}
          {bullets.length > 0 && (
            <ul className="s-bullets">
              {bullets.map((b, i) => (
                <li key={i} className="s-bullet">
                  <span className="s-bullet-marker" aria-hidden />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      );

    case "closing":
    case "cover":
    default:
      return (
        <>
          <div className="s-title">{slide.title}</div>
          {slide.subtitle && <div className="s-subtitle">{slide.subtitle}</div>}
          {slide.verse && <blockquote className="s-verse">{slide.verse}</blockquote>}
        </>
      );
  }
}
