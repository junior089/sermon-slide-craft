import type { SlideDeck } from "@/types/slides";
import { getSupabase } from "@/lib/storage/supabase";
import * as local from "@/lib/storage/local-storage";

// userId nulo significa usuário anônimo: tudo fica no localStorage.

export async function listDecks(userId: string | null): Promise<SlideDeck[]> {
  const supabase = userId ? getSupabase() : null;
  if (!supabase || !userId) return local.loadHistory();

  const { data, error } = await supabase
    .from("decks")
    .select("data")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[deck-repository] listDecks", error);
    return local.loadHistory();
  }
  return (data ?? []).map((row) => row.data as SlideDeck);
}

export async function saveDeck(deck: SlideDeck, userId: string | null): Promise<void> {
  const supabase = userId ? getSupabase() : null;
  if (!supabase || !userId) {
    local.saveDeck(deck);
    return;
  }

  const { error } = await supabase.from("decks").upsert(
    {
      id: deck.id,
      user_id: userId,
      title: deck.title,
      data: deck,
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("[deck-repository] saveDeck", error);
    // Se a nuvem falhar, o deck fica salvo localmente para não perder a edição.
    local.saveDeck(deck);
  }
}

export async function removeDeck(id: string, userId: string | null): Promise<void> {
  const supabase = userId ? getSupabase() : null;
  if (!supabase || !userId) {
    local.removeDeck(id);
    return;
  }

  const { error } = await supabase.from("decks").delete().eq("id", id);
  if (error) console.error("[deck-repository] removeDeck", error);
}

// Copia os decks locais para a conta no primeiro login, sem apagar os locais.
export async function pushLocalDecksToCloud(userId: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;
  const localDecks = local.loadHistory();
  if (localDecks.length === 0) return 0;

  const rows = localDecks.map((deck) => ({
    id: deck.id,
    user_id: userId,
    title: deck.title,
    data: deck,
  }));
  const { error } = await supabase.from("decks").upsert(rows, { onConflict: "id" });
  if (error) {
    console.error("[deck-repository] pushLocalDecksToCloud", error);
    return 0;
  }
  return rows.length;
}
