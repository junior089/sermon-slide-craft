import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { generateText, Output } from "ai";
import { z } from "zod";

import { verifyAccessToken } from "@/lib/auth/verify-access-token";
import {
  enrichDeckVerses,
  extractScriptureReferences,
  resolveScriptureTexts,
  type ResolvedScripture,
} from "@/lib/bible/scripture";
import { getServerEnv, isSupabaseConfigured } from "@/lib/env";
import { generateDemoDeck } from "@/lib/generation/demo-generator";
import { normalizeAiDeck } from "@/lib/generation/normalizer";
import { buildJsonRepairPrompt, buildSlidesPrompt, extractJson } from "@/lib/generation/prompt";
import {
  generationSettingsSchema,
  slideDeckResponseSchema,
  type GenerationInput,
  type SlideDeckResponse,
} from "@/lib/generation/schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import type { AiGenerationTrace } from "@/types/slides";

export interface GenerateSlidesResult {
  source: "ai" | "demo";
  warning?: string;
  deck: SlideDeckResponse;
  trace: AiGenerationTrace;
}

type GenerationStage =
  "chamada-estruturada" | "chamada-texto" | "validacao" | "reparo" | "versiculos";

const generateSlidesRequestSchema = generationSettingsSchema.extend({
  accessToken: z.string().max(4096).optional(),
});

export const generateSlides = createServerFn({ method: "POST" })
  .validator((input: unknown) => generateSlidesRequestSchema.parse(input))
  .handler(async ({ data: request }): Promise<GenerateSlidesResult> => {
    const { accessToken, ...data } = request;
    const env = getServerEnv();
    const modelId = env.NVIDIA_MODEL;
    const baseURL = env.NVIDIA_BASE_URL;

    if (!env.NIM_API_KEY) {
      const { system, user } = buildSlidesPrompt(data);
      return demoResult(data, {
        warning: "Modo demonstração: configure a chave do modelo para usar a geração completa.",
        modelId: "demo-generator",
        system,
        user,
        notes: [
          "NIM_API_KEY ausente: o app usou o gerador de demonstração local.",
          "Tom e motivos visuais foram inferidos por palavras-chave do roteiro.",
        ],
      });
    }

    // A chamada ao modelo tem custo. Com contas habilitadas, só usuários
    // autenticados chegam a ela; os demais recebem a prévia local.
    if (isSupabaseConfigured() && !(await verifyAccessToken(accessToken))) {
      const { system, user } = buildSlidesPrompt(data);
      return demoResult(data, {
        warning:
          "Entre na sua conta para gerar com o modelo de linguagem. Mostrando uma prévia local.",
        modelId: "demo-generator",
        system,
        user,
        notes: ["Usuário não autenticado: a geração com o modelo exige login."],
      });
    }

    // Sem IP identificável a requisição é liberada, para não bloquear quem usa
    // a aplicação atrás de um proxy que não repassa o endereço.
    const ip = clientIp();
    if (ip) {
      const limit = checkRateLimit(
        `gen:${ip}`,
        env.GENERATION_RATE_LIMIT,
        env.GENERATION_RATE_WINDOW_MS,
      );
      if (!limit.allowed) {
        const minutes = Math.max(1, Math.ceil(limit.retryAfterMs / 60_000));
        const windowMinutes = Math.round(env.GENERATION_RATE_WINDOW_MS / 60_000);
        const { system, user } = buildSlidesPrompt(data);
        return demoResult(data, {
          warning: `Muitas gerações em sequência. Aguarde cerca de ${minutes} min e tente de novo. Mostrando uma prévia local enquanto isso.`,
          modelId: "rate-limited",
          system,
          user,
          notes: [
            `Limite de geração atingido para este cliente (${env.GENERATION_RATE_LIMIT} a cada ${windowMinutes} min).`,
            "Foi montada uma prévia local, sem chamar o modelo.",
          ],
        });
      }
    }

    const startedAt = Date.now();
    // O texto das passagens entra no prompt para que o modelo escreva a partir
    // delas, e não só da referência.
    const scriptures = await resolveScripturesForPrompt(data);
    const { system, user } = buildSlidesPrompt(data, scriptures);
    let stage: GenerationStage = "chamada-estruturada";

    try {
      const nvidia = createOpenAICompatible({
        name: "nvidia-nim",
        baseURL,
        headers: { Authorization: `Bearer ${env.NIM_API_KEY}` },
      });

      const generateWithTimeout = (
        systemPrompt: string,
        prompt: string,
        temperature: number,
        structured = false,
      ) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), env.NVIDIA_GENERATION_TIMEOUT_MS);

        return generateText({
          model: nvidia(modelId),
          system: systemPrompt,
          prompt,
          temperature,
          output: structured
            ? Output.object({
                schema: slideDeckResponseSchema,
                name: "VisioDivinaDeck",
                description: "Apresentação de slides de pregação com direção criativa.",
              })
            : undefined,
          abortSignal: controller.signal,
        }).finally(() => clearTimeout(timeout));
      };

      logDebug("prompt", { modelId, baseURL, system, user });

      const notes: string[] = [];
      let firstResult: Awaited<ReturnType<typeof generateWithTimeout>>;
      let usedStructuredOutput = false;
      try {
        firstResult = await generateWithTimeout(system, user, 0.35, true);
        usedStructuredOutput = true;
        notes.push("A chamada usou saída estruturada do AI SDK com o schema Zod.");
      } catch (structuredErr) {
        const message = errorMessage(structuredErr);
        console.warn("[geracao] saída estruturada recusada, repetindo em modo texto", {
          model: modelId,
          error: message,
        });
        notes.push(
          `O provedor não aceitou saída estruturada (${message}); a chamada foi repetida em modo texto JSON.`,
        );
        stage = "chamada-texto";
        firstResult = await generateWithTimeout(system, user, 0.35, false);
      }
      const { text } = firstResult;
      logDebug("raw-response", text);

      stage = "validacao";
      let parsed: SlideDeckResponse;
      let repair: AiGenerationTrace["repair"] | undefined;
      try {
        parsed =
          usedStructuredOutput && firstResult.output
            ? slideDeckResponseSchema.parse(firstResult.output)
            : parseDeckResponse(text);
      } catch (err) {
        const validationError = errorMessage(err);
        logDebug("validation-error", validationError);

        stage = "reparo";
        const repairPrompt = buildJsonRepairPrompt(text, validationError);
        const { text: repairedText } = await generateWithTimeout(
          repairPrompt.system,
          repairPrompt.user,
          0,
        );
        logDebug("repair-response", repairedText);
        repair = { validationError, prompt: repairPrompt, rawResponse: repairedText };
        try {
          parsed = parseDeckResponse(repairedText);
        } catch {
          throw new Error("A geração não retornou um formato válido. Tente reduzir o roteiro.");
        }
      }

      stage = "versiculos";
      const normalized = normalizeAiDeck(
        await enrichDeckVerses(normalizeAiDeck(parsed, data), data.translation),
        data,
      );
      const durationMs = Date.now() - startedAt;
      logDebug("summary", {
        durationMs,
        usedStructuredOutput,
        repaired: Boolean(repair),
        scriptures: scriptures.length,
        slides: normalized.slides.length,
      });

      return {
        source: "ai",
        deck: normalized,
        trace: buildTrace({
          provider: "nvidia",
          modelId,
          baseURL,
          system,
          user,
          rawResponse: text,
          repair,
          deck: normalized,
          notes: [
            ...notes,
            scriptures.length
              ? `${scriptures.length} passagem(ns) bíblica(s) resolvida(s) e incluída(s) no prompt (${scriptures
                  .map((s) => s.reference)
                  .join(", ")}).`
              : "Nenhuma referência bíblica no formato capítulo:versículo foi encontrada no roteiro.",
            repair
              ? "A primeira resposta veio fora do schema; foi necessária uma chamada de reparo de JSON."
              : "Resposta validada pelo Zod sem necessidade de reparo.",
            `Tempo de geração: ${(durationMs / 1000).toFixed(1)} s.`,
            "Versículos sem texto foram buscados por referência no serviço bíblico configurado.",
          ],
        }),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao gerar a apresentação.";
      console.error("[geracao] falha na geração com o modelo", {
        model: modelId,
        stage,
        durationMs: Date.now() - startedAt,
        error: err instanceof Error ? { name: err.name, message, stack: err.stack } : message,
      });
      return demoResult(data, {
        warning: `Não foi possível concluir a geração (${message}). Exibindo uma prévia local.`,
        modelId,
        baseURL,
        system,
        user,
        notes: [
          `Falha na etapa "${stage}": ${message}`,
          "O app usou o gerador de demonstração local para não interromper a revisão.",
        ],
      });
    }
  });

export type { GenerationInput };

async function demoResult(
  data: GenerationInput,
  options: {
    warning: string;
    modelId: string;
    baseURL?: string;
    system: string;
    user: string;
    notes: string[];
  },
): Promise<GenerateSlidesResult> {
  const deck = normalizeAiDeck(
    await enrichDeckVerses(generateDemoDeck(data), data.translation),
    data,
  );
  return {
    source: "demo",
    warning: options.warning,
    deck,
    trace: buildTrace({
      provider: "demo",
      modelId: options.modelId,
      baseURL: options.baseURL,
      system: options.system,
      user: options.user,
      rawResponse: JSON.stringify(deck, null, 2),
      deck,
      notes: options.notes,
    }),
  };
}

async function resolveScripturesForPrompt(data: GenerationInput): Promise<ResolvedScripture[]> {
  try {
    const references = extractScriptureReferences(data.text);
    return references.length ? await resolveScriptureTexts(references, data.translation) : [];
  } catch {
    return [];
  }
}

function clientIp(): string {
  try {
    return getRequestIP({ xForwardedFor: true }) ?? "";
  } catch {
    return "";
  }
}

function parseDeckResponse(raw: string) {
  return slideDeckResponseSchema.parse(extractJson(raw));
}

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Resposta fora do formato esperado.";
}

function logDebug(label: string, payload: unknown) {
  if (!getServerEnv().DEBUG_AI_PROMPT) return;
  console.info(`[geracao] ${label}`, payload);
}

function buildTrace({
  provider,
  modelId,
  baseURL,
  system,
  user,
  rawResponse,
  repair,
  deck,
  notes,
}: {
  provider: AiGenerationTrace["provider"];
  modelId: string;
  baseURL?: string;
  system: string;
  user: string;
  rawResponse: string;
  repair?: AiGenerationTrace["repair"];
  deck: SlideDeckResponse;
  notes: string[];
}): AiGenerationTrace {
  return {
    provider,
    model: modelId,
    baseURL,
    generatedAt: Date.now(),
    usedRecommendedTemplate: false,
    selectedTemplate: deck.creativeDirection?.recommendedTemplate ?? "cinematic",
    prompt: { system, user },
    rawResponse,
    repair,
    notes,
  };
}
