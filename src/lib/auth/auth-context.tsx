import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import { AuthContext, type AuthContextValue } from "@/lib/auth/context";
import { resolveRole } from "@/lib/auth/roles";
import { getSupabase, isSupabaseConfigured } from "@/lib/storage/supabase";

export function AuthProvider({ children }: { children: ReactNode }) {
  const enabled = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      enabled,
      loading,
      session,
      user: session?.user ?? null,
      role: resolveRole(session?.user ?? null),
      async signInWithPassword(email, password) {
        const supabase = getSupabase();
        if (!supabase) return { error: "Backend não configurado." };
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error ? { error: translateAuthError(error.message) } : {};
      },
      async signUpWithPassword(email, password) {
        const supabase = getSupabase();
        if (!supabase) return { error: "Backend não configurado." };
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { error: translateAuthError(error.message) };
        // Sem sessão imediata, o projeto exige confirmação por e-mail.
        return { needsConfirmation: !data.session };
      },
      async signOut() {
        const supabase = getSupabase();
        await supabase?.auth.signOut();
      },
    }),
    [enabled, loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("already registered")) return "Este e-mail já está cadastrado.";
  if (m.includes("password should be at least")) return "A senha deve ter pelo menos 6 caracteres.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "E-mail inválido.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  return message;
}
