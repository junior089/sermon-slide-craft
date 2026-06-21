import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { clientEnv } from "@/lib/env";

// A chave anon é pública por definição; quem protege os dados é o RLS.
const url = clientEnv.VITE_SUPABASE_URL;
const anonKey = clientEnv.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  if (!url || !anonKey) return null;
  if (typeof window === "undefined") return null;
  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}

export { isSupabaseConfigured } from "@/lib/env";
