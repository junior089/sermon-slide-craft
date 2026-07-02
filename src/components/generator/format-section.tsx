import { Field, FormSection, ToggleRow } from "@/components/generator/form-fields";
import { STYLE_PRESETS } from "@/components/generator/presets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRANSLATIONS } from "@/lib/bible/translations";
import { DISPLAY_MODES } from "@/lib/slide-presets";
import { cn } from "@/lib/utils";
import type { GenerationSettings } from "@/types/slides";

interface Props {
  settings: GenerationSettings;
  onChange: (patch: Partial<GenerationSettings>) => void;
}

export function FormatSection({ settings, onChange }: Props) {
  return (
    <FormSection title="Formato">
      <Field label="Predefinição">
        <div className="grid grid-cols-2 gap-2">
          {STYLE_PRESETS.map((preset) => {
            const active =
              settings.style === preset.patch.style &&
              settings.density === preset.patch.density &&
              settings.displayMode === preset.patch.displayMode;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange(preset.patch)}
                className={cn(
                  "flex flex-col gap-0.5 rounded-md border px-3.5 py-3 text-left transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent hover:border-primary/60",
                )}
              >
                <span className="text-sm font-medium">{preset.label}</span>
                <span
                  className={cn(
                    "text-xs",
                    active ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {preset.hint}
                </span>
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Estilo">
          <Select
            value={settings.style}
            onValueChange={(v) => onChange({ style: v as GenerationSettings["style"] })}
          >
            <SelectTrigger className="h-11 rounded-md bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="culto-principal">Culto principal</SelectItem>
              <SelectItem value="estudo-biblico">Estudo bíblico</SelectItem>
              <SelectItem value="jovens">Jovens</SelectItem>
              <SelectItem value="conferencia">Conferência</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Nível de síntese">
          <Select
            value={settings.density}
            onValueChange={(v) => onChange({ density: v as GenerationSettings["density"] })}
          >
            <SelectTrigger className="h-11 rounded-md bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direto">Direto</SelectItem>
              <SelectItem value="equilibrado">Equilibrado</SelectItem>
              <SelectItem value="detalhado">Detalhado</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field
        label="Exibição"
        hint={DISPLAY_MODES.find((m) => m.value === settings.displayMode)?.hint}
      >
        <Select
          value={settings.displayMode}
          onValueChange={(v) => onChange({ displayMode: v as GenerationSettings["displayMode"] })}
        >
          <SelectTrigger className="h-11 rounded-md bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DISPLAY_MODES.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field
        label="Tradução bíblica"
        hint="Almeida é de domínio público. NVI, ARA e ACF exigem licença e configuração no servidor."
      >
        <Select
          value={settings.translation ?? "almeida"}
          onValueChange={(v) => onChange({ translation: v as GenerationSettings["translation"] })}
        >
          <SelectTrigger className="h-11 rounded-md bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRANSLATIONS.map((t) => (
              <SelectItem key={t.key} value={t.key} disabled={!t.publicDomain}>
                {t.label}
                {!t.publicDomain ? " · requer licença" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Incluir">
        <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
          <ToggleRow
            id="vrs"
            label="Destacar versículos"
            checked={settings.highlightVerses}
            onChange={(v) => onChange({ highlightVerses: v })}
          />
          <ToggleRow
            id="opn"
            label="Notas para o operador de mídia"
            checked={settings.generateOperatorNotes}
            onChange={(v) => onChange({ generateOperatorNotes: v })}
          />
          <ToggleRow
            id="blk"
            label="Sugerir divisão em blocos"
            checked={settings.suggestBlocks}
            onChange={(v) => onChange({ suggestBlocks: v })}
          />
        </div>
      </Field>
    </FormSection>
  );
}
