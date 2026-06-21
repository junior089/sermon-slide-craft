import type { SlideTemplate } from "@/types/slides";

export interface BrandKit {
  churchName?: string;
  // Data URL em vez de link externo: imagens de outra origem quebram a exportação por CORS.
  logo?: string;
  accentColor?: string;
  template?: SlideTemplate;
}

const KEY = "visio-divina:brand-kit";

export function getBrandKit(): BrandKit {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BrandKit) : {};
  } catch {
    return {};
  }
}

export function saveBrandKit(kit: BrandKit): void {
  if (typeof window === "undefined") return;
  const merged: BrandKit = { ...getBrandKit() };
  for (const [k, v] of Object.entries(kit) as [keyof BrandKit, unknown][]) {
    if (v === undefined || v === "") delete merged[k];
    else (merged as Record<string, unknown>)[k] = v;
  }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    // Cota do localStorage cheia (logo grande): o kit não é salvo, mas o app segue.
  }
}

export function hasBrandKit(): boolean {
  const k = getBrandKit();
  return Boolean(k.churchName || k.logo || k.accentColor || k.template);
}
