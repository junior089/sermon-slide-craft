import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((value) => value?.trim() || undefined);

const flag = z
  .string()
  .optional()
  .transform((value) => value?.trim().toLowerCase() === "true");

function positiveInt(fallback: number) {
  return z.coerce.number().int().positive().catch(fallback);
}

function url(fallback: string) {
  return z.string().trim().url().catch(fallback);
}

const serverEnvSchema = z.object({
  NIM_API_KEY: optionalString,
  NVIDIA_BASE_URL: url("https://integrate.api.nvidia.com/v1"),
  NVIDIA_MODEL: z.string().trim().min(1).catch("meta/llama-3.3-70b-instruct"),
  NVIDIA_GENERATION_TIMEOUT_MS: positiveInt(300_000),
  DEBUG_AI_PROMPT: flag,
  GENERATION_RATE_LIMIT: positiveInt(20),
  GENERATION_RATE_WINDOW_MS: positiveInt(300_000),
  BIBLE_API_URL: url("https://bible-api.com"),
  ABIBLIA_API_URL: url("https://www.abibliadigital.com.br/api"),
  BIBLE_API_TOKEN: optionalString,
  BIBLE_LICENSED_ENABLED: flag,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let serverEnv: ServerEnv | undefined;

// Lido sob demanda porque este módulo também entra no bundle do cliente, onde
// process.env não existe.
export function getServerEnv(): ServerEnv {
  serverEnv ??= serverEnvSchema.parse(process.env);
  return serverEnv;
}

const clientEnvSchema = z.object({
  VITE_SUPABASE_URL: optionalString.pipe(z.string().url().optional().catch(undefined)),
  VITE_SUPABASE_ANON_KEY: optionalString,
});

// O Vite só substitui import.meta.env.VITE_* quando o acesso é literal, por
// isso cada variável é lida pelo nome. Os valores são fixados no build e valem
// igualmente para o cliente e para o SSR.
export const clientEnv = clientEnvSchema.parse({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
});

export function isSupabaseConfigured(): boolean {
  return Boolean(clientEnv.VITE_SUPABASE_URL && clientEnv.VITE_SUPABASE_ANON_KEY);
}
