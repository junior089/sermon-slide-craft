// Almeida é de domínio público. NVI (© Biblica), ARA e ACF (© SBB) exigem
// licença e só são liberadas pelo servidor quando habilitadas (ver bible.ts).

export type TranslationKey = "almeida" | "nvi" | "ara" | "acf";

export interface TranslationMeta {
  key: TranslationKey;
  label: string;
  provider: "bible-api" | "abibliadigital";
  apiId: string;
  publicDomain: boolean;
}

export const TRANSLATIONS: TranslationMeta[] = [
  {
    key: "almeida",
    label: "Almeida (domínio público)",
    provider: "bible-api",
    apiId: "almeida",
    publicDomain: true,
  },
  {
    key: "nvi",
    label: "Nova Versão Internacional (NVI)",
    provider: "abibliadigital",
    apiId: "nvi",
    publicDomain: false,
  },
  {
    key: "ara",
    label: "Almeida Revista e Atualizada (ARA)",
    provider: "abibliadigital",
    apiId: "ra",
    publicDomain: false,
  },
  {
    key: "acf",
    label: "Almeida Corrigida Fiel (ACF)",
    provider: "abibliadigital",
    apiId: "acf",
    publicDomain: false,
  },
];

export const DEFAULT_TRANSLATION_KEY: TranslationKey = "almeida";

export const TRANSLATION_KEYS = TRANSLATIONS.map((t) => t.key) as [
  TranslationKey,
  ...TranslationKey[],
];

export function getTranslationMeta(key?: string): TranslationMeta {
  return TRANSLATIONS.find((t) => t.key === key) ?? TRANSLATIONS[0];
}
