import { createClient } from "@supabase/supabase-js";

import { clientEnv } from "@/lib/env";

// Valida o token no servidor de autenticação do Supabase. Decodificar o JWT
// localmente não bastaria: um token revogado continuaria aceito até expirar.
export async function verifyAccessToken(token: string | undefined): Promise<string | null> {
  const url = clientEnv.VITE_SUPABASE_URL;
  const anonKey = clientEnv.VITE_SUPABASE_ANON_KEY;
  if (!token || !url || !anonKey) return null;

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user.id;
  } catch (err) {
    console.error("[auth] falha ao validar o token de acesso", err);
    return null;
  }
}
