import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ClipboardPaste, Eraser, Lightbulb, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

import {
  buildDeckFromResult,
  computeFormMetrics,
  createSampleDeck,
} from "@/components/generator/build-deck";
import { ActionButton, Field, FormSection, Stat } from "@/components/generator/form-fields";
import { FormatSection } from "@/components/generator/format-section";
import { DEFAULT_SETTINGS, EXAMPLE_SCRIPT, EXAMPLE_THEME } from "@/components/generator/presets";
import { TemplateGallery } from "@/components/template-gallery";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth/use-auth";
import { generateDemoDeck } from "@/lib/generation/demo-generator";
import { generateSlides, type GenerateSlidesResult } from "@/lib/generation/generate-slides";
import { getBrandKit } from "@/lib/storage/brand-kit";
import { saveDeck } from "@/lib/storage/deck-repository";
import { cn } from "@/lib/utils";
import type { GenerationSettings, SlideDeck, SlideTemplate } from "@/types/slides";

const DRAFT_KEY = "visio-divina:generator-draft";
// Um pouco acima do timeout do servidor, para que o erro dele chegue primeiro.
const CLIENT_GENERATION_TIMEOUT_MS = 305_000;

interface Draft {
  text?: string;
  theme?: string;
  series?: string;
  preacher?: string;
  template?: SlideTemplate;
  templateTouched?: boolean;
  settings?: GenerationSettings;
}

interface Props {
  onGenerated: (deck: SlideDeck, warning?: string) => void;
  onGeneratingChange?: (active: boolean, meta?: { estimate?: number }) => void;
}

export function GeneratorForm({ onGenerated, onGeneratingChange }: Props) {
  const generate = useServerFn(generateSlides);
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const [text, setText] = useState("");
  const [theme, setTheme] = useState("");
  const [series, setSeries] = useState("");
  const [preacher, setPreacher] = useState("");
  const [template, setTemplate] = useState<SlideTemplate>("cinematic");
  const [templateTouched, setTemplateTouched] = useState(false);
  const [settings, setSettings] = useState<GenerationSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setError(null);
  }, [text, theme, series, preacher, settings]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Draft;
        setText(draft.text ?? "");
        setTheme(draft.theme ?? "");
        setSeries(draft.series ?? "");
        setPreacher(draft.preacher ?? "");
        if (draft.template) {
          setTemplate(draft.template);
          setTemplateTouched(Boolean(draft.templateTouched));
        } else {
          const kit = getBrandKit();
          if (kit.template) setTemplate(kit.template);
        }
        if (draft.settings) setSettings((current) => ({ ...current, ...draft.settings }));
      }
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!draftLoaded || typeof window === "undefined") return;
    const draft: Draft = { text, theme, series, preacher, template, templateTouched, settings };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draftLoaded, preacher, series, settings, template, templateTouched, text, theme]);

  const metrics = useMemo(
    () => computeFormMetrics({ text, theme, series, preacher }, settings),
    [preacher, series, settings, text, theme],
  );

  const sampleDeck = useMemo(
    () => createSampleDeck({ theme, series, preacher }, template, settings),
    [template, theme, series, preacher, settings],
  );

  function updateSettings(patch: Partial<GenerationSettings>) {
    setSettings((current) => ({ ...current, ...patch }));
  }

  async function pasteFromClipboard() {
    try {
      const value = await navigator.clipboard.readText();
      if (!value.trim()) {
        toast.warning("A área de transferência está vazia.");
        return;
      }
      setText((current) =>
        current.trim() ? `${current.trim()}\n\n${value.trim()}` : value.trim(),
      );
      toast.success("Texto colado no roteiro.");
    } catch {
      toast.error("Não consegui acessar a área de transferência.");
    }
  }

  function clearAll() {
    setText("");
    setTheme("");
    setSeries("");
    setPreacher("");
    setTemplate("cinematic");
    setTemplateTouched(false);
    setSettings(DEFAULT_SETTINGS);
    if (typeof window !== "undefined") window.localStorage.removeItem(DRAFT_KEY);
    toast.success("Rascunho limpo.");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 40) {
      setError("Cole um roteiro com pelo menos 40 caracteres.");
      return;
    }
    setLoading(true);
    setError(null);
    onGeneratingChange?.(true, { estimate: metrics.suggestedSlides || undefined });
    try {
      const input = {
        ...settings,
        translation: settings.translation ?? "almeida",
        theme,
        series,
        preacher,
        text,
        preferredTemplate: template,
        templateLocked: templateTouched,
      };
      let timeout: ReturnType<typeof setTimeout> | undefined;
      const fallback = new Promise<GenerateSlidesResult>((resolve) => {
        timeout = setTimeout(() => {
          const fallbackDeck = generateDemoDeck(input);
          resolve({
            source: "demo",
            warning:
              "A geração online passou de 5 minutos. Montei uma prévia local para você revisar agora.",
            deck: fallbackDeck,
            trace: {
              provider: "demo",
              model: "client-timeout-demo",
              generatedAt: Date.now(),
              usedRecommendedTemplate: false,
              selectedTemplate: fallbackDeck.creativeDirection?.recommendedTemplate ?? template,
              prompt: {
                system: "O cliente atingiu o tempo limite antes da resposta completa do modelo.",
                user: JSON.stringify(input, null, 2),
              },
              rawResponse: JSON.stringify(fallbackDeck, null, 2),
              notes: [
                "A chamada online ultrapassou o tempo limite do cliente.",
                "Foi montada uma prévia local para não interromper a revisão.",
              ],
            },
          });
        }, CLIENT_GENERATION_TIMEOUT_MS);
      });
      const result = await Promise.race([
        generate({ data: { ...input, accessToken: session?.access_token } }),
        fallback,
      ]);
      if (timeout) clearTimeout(timeout);

      const deck = buildDeckFromResult({
        result,
        fields: { theme, series, preacher },
        settings,
        template,
        templateLocked: templateTouched,
        brandKit: getBrandKit(),
      });
      await saveDeck(deck, user?.id ?? null);
      onGenerated(deck, result.warning);
      if (result.warning) toast.warning(result.warning);
      else toast.success("Apresentação pronta para revisão.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      setError(message);
    } finally {
      setLoading(false);
      onGeneratingChange?.(false);
    }
  }

  return (
    <section className="generator-panel">
      <form onSubmit={onSubmit} className="flex flex-col">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="u-eyebrow !text-[0.6rem]">Entrada</span>
              <h2 className="u-display mt-2 text-[2rem] leading-none">Roteiro da pregação</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton icon={ClipboardPaste} label="Colar" onClick={pasteFromClipboard} />
              <ActionButton
                icon={Lightbulb}
                label="Exemplo"
                onClick={() => {
                  setText(EXAMPLE_SCRIPT);
                  setTheme(EXAMPLE_THEME);
                }}
              />
              <ActionButton icon={Eraser} label="Limpar" onClick={clearAll} />
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-y divide-border border-y border-border sm:grid-cols-4 sm:divide-y-0">
            <Stat label="Palavras" value={metrics.words.toString()} />
            <Stat label="Leitura" value={`~${metrics.readMinutes} min`} />
            <Stat
              label="Slides"
              value={metrics.suggestedSlides ? `${metrics.suggestedSlides}` : "—"}
            />
            <Stat label="Preparo" value={`${metrics.readiness}/4`} />
          </div>
        </header>

        <FormSection title="Conteúdo">
          <Field htmlFor="text" label="Cole o roteiro, esboço ou estudo">
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Título, texto base, pontos principais, aplicações..."
              className="min-h-[240px] resize-y rounded-md border-border bg-background font-mono text-sm leading-relaxed shadow-none"
              required
              minLength={40}
              maxLength={20000}
            />
            <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
              <span>{text.length.toLocaleString("pt-BR")} / 20.000</span>
              <span>Mínimo 40 caracteres</span>
            </div>
          </Field>
        </FormSection>

        <FormSection title="Mensagem">
          <Field htmlFor="theme" label="Tema (opcional)">
            <Input
              id="theme"
              placeholder="Ex.: Fé em tempos de pressão"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="h-11 rounded-md bg-background"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field htmlFor="series" label="Série (opcional)">
              <Input
                id="series"
                placeholder="No meio do fogo"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                className="h-11 rounded-md bg-background"
              />
            </Field>
            <Field htmlFor="preacher" label="Pregador (opcional)">
              <Input
                id="preacher"
                placeholder="Pr. João Silva"
                value={preacher}
                onChange={(e) => setPreacher(e.target.value)}
                className="h-11 rounded-md bg-background"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Visual">
          <Field label="Tema visual" hint="Escolha agora ou ajuste depois na revisão.">
            <TemplateGallery
              deck={sampleDeck}
              onSelect={(value) => {
                setTemplate(value);
                setTemplateTouched(true);
              }}
            />
          </Field>
        </FormSection>

        <FormatSection settings={settings} onChange={updateSettings} />

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-7 border-t border-border pt-6">
          <button
            type="submit"
            disabled={loading}
            className={cn(buttonVariants({ size: "lg" }), "h-[52px] w-full text-center")}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Estruturando slides...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 size-4" />
                Gerar apresentação
              </>
            )}
          </button>
          <p className="mt-2.5 text-center text-xs text-muted-foreground">
            A quantidade de slides acompanha o tamanho do roteiro e o nível de síntese.
          </p>
        </div>
      </form>
    </section>
  );
}
