import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth/use-auth";
import { pushLocalDecksToCloud } from "@/lib/storage/deck-repository";
import { getSupabase } from "@/lib/storage/supabase";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Visio Divina" },
      { name: "description", content: "Entre na sua conta para salvar apresentações na nuvem." },
    ],
  }),
  component: EntrarPage,
});

type Mode = "signin" | "signup";

function EntrarPage() {
  const { enabled, user, signInWithPassword, signUpWithPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await signInWithPassword(email, password);
        if (error) return setError(error);
        await afterAuth();
      } else {
        const { error, needsConfirmation } = await signUpWithPassword(email, password);
        if (error) return setError(error);
        if (needsConfirmation) {
          toast.success("Cadastro criado. Confirme pelo e-mail para entrar.");
          setMode("signin");
          return;
        }
        await afterAuth();
      }
    } finally {
      setLoading(false);
    }
  }

  async function afterAuth() {
    const supabase = getSupabase();
    const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    const id = data.user?.id;
    if (id) {
      const count = await pushLocalDecksToCloud(id);
      if (count > 0) toast.success(`${count} deck(s) local(is) enviados para sua conta.`);
    }
    navigate({ to: "/gerar" });
  }

  if (user) {
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-md px-5 py-20 text-center">
          <h1 className="u-display text-4xl">Você já está conectado</h1>
          <p className="mt-3 text-muted-foreground">{user.email}</p>
          <Button className="mt-6" onClick={() => navigate({ to: "/gerar" })}>
            Ir para o editor
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-md px-5 py-16 md:py-20">
        <span className="u-eyebrow">Acesso restrito</span>
        <h1 className="t-section mt-4">{mode === "signin" ? "Entrar" : "Criar conta"}</h1>
        <p className="mt-3 text-muted-foreground">
          Entre para salvar suas apresentações na nuvem e acessá-las em qualquer dispositivo.
        </p>

        {!enabled && (
          <Alert className="mt-6">
            <AlertDescription>
              Backend não configurado. Defina <code>VITE_SUPABASE_URL</code> e{" "}
              <code>VITE_SUPABASE_ANON_KEY</code> em <code>.env.local</code> para habilitar contas.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-background"
              placeholder="voce@igreja.com"
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 bg-background"
              placeholder="Mínimo 6 caracteres"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading || !enabled} className="h-11">
            {loading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 size-4" />
            )}
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === "signin" ? "signup" : "signin"));
            setError(null);
          }}
          className="mt-6 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {mode === "signin" ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}
        </button>
      </div>
    </AppShell>
  );
}
