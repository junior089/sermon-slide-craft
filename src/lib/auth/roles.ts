import type { User } from "@supabase/supabase-js";

export type AppRole = "operador" | "revisor" | "academico";

const ROLES: readonly AppRole[] = ["operador", "revisor", "academico"];

// O papel vem de app_metadata.role, que o usuário não consegue editar. Sem
// papel definido, o padrão é "academico" para não esconder os Bastidores;
// quem administra restringe definindo o papel no Supabase.
export function resolveRole(user: User | null): AppRole {
  const raw = (user?.app_metadata?.role ?? user?.user_metadata?.role) as unknown;
  return ROLES.includes(raw as AppRole) ? (raw as AppRole) : "academico";
}

export function rolePermissions(role: AppRole) {
  return {
    canSeeBastidores: role === "academico",
  };
}
