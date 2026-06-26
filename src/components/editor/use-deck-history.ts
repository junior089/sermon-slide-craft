import { useEffect, useRef, useState } from "react";

import { saveDeck } from "@/lib/storage/deck-repository";
import type { SlideDeck } from "@/types/slides";

const SAVE_DEBOUNCE_MS = 600;
const COALESCE_WINDOW_MS = 700;
const MAX_HISTORY = 60;

export function useDeckHistory(
  deck: SlideDeck,
  onChange: (deck: SlideDeck) => void,
  userId: string | null,
) {
  // A interface atualiza na hora, mas a gravação espera uma pausa na digitação.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSave = useRef<SlideDeck | null>(null);
  // Em ref para o flush no unmount, que roda num efeito sem dependências.
  const userIdRef = useRef<string | null>(userId);
  userIdRef.current = userId;

  const past = useRef<SlideDeck[]>([]);
  const future = useRef<SlideDeck[]>([]);
  const lastSnapshot = useRef(0);
  const [, bumpHistory] = useState(0);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (pendingSave.current) saveDeck(pendingSave.current, userIdRef.current);
    };
  }, []);

  useEffect(() => {
    past.current = [];
    future.current = [];
    lastSnapshot.current = 0;
    bumpHistory((n) => n + 1);
  }, [deck.id]);

  function commit(next: SlideDeck) {
    onChange(next);
    pendingSave.current = next;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (pendingSave.current) saveDeck(pendingSave.current, userIdRef.current);
      pendingSave.current = null;
      saveTimer.current = null;
    }, SAVE_DEBOUNCE_MS);
  }

  function update(next: SlideDeck) {
    const now = Date.now();
    // Edições em sequência rápida viram um único passo de desfazer.
    if (now - lastSnapshot.current > COALESCE_WINDOW_MS) {
      past.current.push(deck);
      if (past.current.length > MAX_HISTORY) past.current.shift();
      future.current = [];
      bumpHistory((n) => n + 1);
    }
    lastSnapshot.current = now;
    commit(next);
  }

  function undo(): SlideDeck | undefined {
    const prev = past.current.pop();
    if (!prev) return undefined;
    future.current.push(deck);
    lastSnapshot.current = 0;
    bumpHistory((n) => n + 1);
    commit(prev);
    return prev;
  }

  function redo(): SlideDeck | undefined {
    const next = future.current.pop();
    if (!next) return undefined;
    past.current.push(deck);
    lastSnapshot.current = 0;
    bumpHistory((n) => n + 1);
    commit(next);
    return next;
  }

  return {
    update,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}
