import type { SlideDeck } from "@/types/slides";

const KEY = "visio-divina:history";
const MAX = 12;

export function loadHistory(): SlideDeck[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDeck(deck: SlideDeck) {
  if (typeof window === "undefined") return;
  const list = loadHistory().filter((d) => d.id !== deck.id);
  list.unshift(deck);
  window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}

export function removeDeck(id: string) {
  if (typeof window === "undefined") return;
  const list = loadHistory().filter((d) => d.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(list));
}
