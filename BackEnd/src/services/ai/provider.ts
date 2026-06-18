import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";

/**
 * Capa de abstracción del proveedor de IA, compatible con la API de OpenAI.
 *
 * Habla por `fetch` nativo (Node 20+) contra cualquier endpoint que implemente
 * `POST {baseUrl}/chat/completions` con el esquema de OpenAI (Groq por defecto).
 * Cambiar de proveedor es solo configuración (`AI_BASE_URL` + `AI_MODEL`), y hay
 * un fallback opcional a Gemini que se intenta si el principal falla.
 *
 * Responsabilidades de esta capa: timeouts, reintentos con backoff ante 429/5xx
 * (respetando `Retry-After`) y conmutación al fallback. El logging de uso por
 * usuario (tokens/latencia) lo hace el service del asistente, que tiene el contexto.
 */

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  /** 0-2; por defecto algo bajo para respuestas consistentes. */
  temperature?: number;
  maxTokens?: number;
  /** Fuerza salida JSON (`response_format: json_object`) cuando el proveedor lo soporta. */
  json?: boolean;
  /** Señal externa (p. ej. el request del cliente se cerró) para abortar la llamada. */
  signal?: AbortSignal;
}

export interface ChatCompletionResult {
  content: string;
  provider: string;
  model: string;
  usage?: TokenUsage;
  latencyMs: number;
}

/** Trozos emitidos durante el streaming. */
export type StreamChunk =
  | { type: "delta"; text: string }
  | { type: "done"; provider: string; model: string; usage?: TokenUsage; latencyMs: number };

/** Error técnico de un proveedor concreto (status 0 = red/timeout/cancelación). */
export class AiProviderError extends Error {
  public readonly provider: string;
  public readonly status: number;

  constructor(provider: string, status: number, message: string) {
    super(message);
    this.name = "AiProviderError";
    this.provider = provider;
    this.status = status;
    Object.setPrototypeOf(this, AiProviderError.prototype);
  }
}

interface ProviderConfig {
  name: string;
  apiKey: string;
  baseUrl: string;
  model: string;
}

// Forma parcial de la respuesta de OpenAI/Groq que nos interesa leer.
interface OpenAiChoice {
  delta?: { content?: string };
  message?: { content?: string };
}
interface OpenAiUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}
interface OpenAiChatResponse {
  choices?: OpenAiChoice[];
  usage?: OpenAiUsage;
}

const DEFAULT_TEMPERATURE = 0.4;
const BACKOFF_BASE_MS = 500;
const BACKOFF_MAX_MS = 8_000;
const ERROR_DETAIL_MAX_CHARS = 500;

/**
 * Proveedores a intentar en orden: principal y, si está habilitado, el fallback.
 * Se omiten los que no tienen API key configurada.
 */
function resolveProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];
  if (env.ai.apiKey) {
    providers.push({
      name: env.ai.provider,
      apiKey: env.ai.apiKey,
      baseUrl: env.ai.baseUrl,
      model: env.ai.model,
    });
  }
  if (env.ai.fallback.enabled && env.ai.fallback.apiKey) {
    providers.push({
      name: "gemini",
      apiKey: env.ai.fallback.apiKey,
      baseUrl: env.ai.fallback.baseUrl,
      model: env.ai.fallback.model,
    });
  }
  return providers;
}

function completionsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
}

function buildPayload(
  provider: ProviderConfig,
  options: ChatCompletionOptions,
  stream: boolean,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    model: provider.model,
    messages: options.messages,
    temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    stream,
  };
  if (options.maxTokens) {
    payload.max_tokens = options.maxTokens;
  }
  if (options.json) {
    payload.response_format = { type: "json_object" };
  }
  if (stream) {
    // Pide el bloque de `usage` en el último evento del stream.
    payload.stream_options = { include_usage: true };
  }
  return payload;
}

function mapUsage(usage?: OpenAiUsage): TokenUsage | undefined {
  if (!usage) {
    return undefined;
  }
  return {
    promptTokens: usage.prompt_tokens ?? 0,
    completionTokens: usage.completion_tokens ?? 0,
    totalTokens: usage.total_tokens ?? 0,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffMs(attempt: number): number {
  const exponential = Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** attempt);
  const jitter = Math.floor(Math.random() * BACKOFF_BASE_MS);
  return exponential + jitter;
}

/** `Retry-After` puede ser segundos o una fecha HTTP. Devuelve ms o undefined. */
function parseRetryAfter(header: string | null): number | undefined {
  if (!header) {
    return undefined;
  }
  if (/^\d+$/.test(header.trim())) {
    return Number(header.trim()) * 1000;
  }
  const dateMs = Date.parse(header);
  if (!Number.isNaN(dateMs)) {
    const diff = dateMs - Date.now();
    return diff > 0 ? diff : 0;
  }
  return undefined;
}

/** Libera el cuerpo de una respuesta que vamos a descartar (entre reintentos). */
async function drain(response: Response): Promise<void> {
  try {
    await response.body?.cancel();
  } catch {
    // sin acción: solo liberamos el socket.
  }
}

async function safeReadError(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.slice(0, ERROR_DETAIL_MAX_CHARS);
  } catch {
    return "";
  }
}

/** Una única llamada HTTP con timeout propio combinado con la señal externa. */
async function fetchOnce(
  provider: ProviderConfig,
  payload: Record<string, unknown>,
  externalSignal?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  const onAbort = (): void => controller.abort();
  if (externalSignal) {
    externalSignal.addEventListener("abort", onAbort, { once: true });
  }
  const timeout = setTimeout(() => controller.abort(), env.ai.requestTimeoutMs);
  try {
    return await fetch(completionsUrl(provider.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
    if (externalSignal) {
      externalSignal.removeEventListener("abort", onAbort);
    }
  }
}

/**
 * Llama a un proveedor con reintentos ante 429/5xx y errores de red, respetando
 * `Retry-After`. Devuelve la respuesta OK o lanza `AiProviderError` al agotarse.
 */
async function fetchWithRetry(
  provider: ProviderConfig,
  payload: Record<string, unknown>,
  externalSignal?: AbortSignal,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= env.ai.maxRetries; attempt += 1) {
    let response: Response;
    try {
      response = await fetchOnce(provider, payload, externalSignal);
    } catch (error) {
      // El cliente canceló: no tiene sentido reintentar.
      if (externalSignal?.aborted) {
        throw new AiProviderError(provider.name, 0, "Petición cancelada por el cliente");
      }
      lastError = error;
      if (attempt < env.ai.maxRetries) {
        await sleep(backoffMs(attempt));
        continue;
      }
      throw new AiProviderError(provider.name, 0, errorMessage(error));
    }

    if (response.ok) {
      return response;
    }

    const isRetryable = response.status === 429 || response.status >= 500;
    if (isRetryable && attempt < env.ai.maxRetries) {
      const waitMs = parseRetryAfter(response.headers.get("retry-after")) ?? backoffMs(attempt);
      await drain(response);
      logger.warn("ai_provider_retry", {
        provider: provider.name,
        status: response.status,
        attempt,
        waitMs,
      });
      await sleep(waitMs);
      continue;
    }

    const detail = await safeReadError(response);
    throw new AiProviderError(provider.name, response.status, detail || `HTTP ${response.status}`);
  }

  throw new AiProviderError(provider.name, 0, errorMessage(lastError));
}

/**
 * Ejecuta `run` contra el proveedor principal y, si falla, contra el fallback.
 * Solo cubre el establecimiento de la llamada (antes de empezar a emitir tokens),
 * por eso sirve igual para streaming y no-streaming.
 */
async function callWithFallback<T>(run: (provider: ProviderConfig) => Promise<T>): Promise<T> {
  const providers = resolveProviders();
  if (providers.length === 0) {
    throw new ApiError(503, "El asistente de IA no está configurado (falta GROQ_API_KEY)");
  }

  let lastError: unknown;
  for (const provider of providers) {
    try {
      return await run(provider);
    } catch (error) {
      lastError = error;
      logger.error("ai_provider_failed", { provider: provider.name, error: errorMessage(error) });
      // Continúa con el siguiente proveedor (fallback), si lo hay.
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new AiProviderError("desconocido", 0, "Todos los proveedores de IA fallaron");
}

/** Completa un chat sin streaming. Útil para forzar y validar un JSON estructurado. */
export async function createChatCompletion(
  options: ChatCompletionOptions,
): Promise<ChatCompletionResult> {
  const startedAt = Date.now();
  return callWithFallback(async (provider) => {
    const response = await fetchWithRetry(provider, buildPayload(provider, options, false), options.signal);
    const json = (await response.json()) as OpenAiChatResponse;
    return {
      content: json.choices?.[0]?.message?.content ?? "",
      provider: provider.name,
      model: provider.model,
      usage: mapUsage(json.usage),
      latencyMs: Date.now() - startedAt,
    };
  });
}

/** Lee el stream SSE de OpenAI/Groq y emite deltas de texto y un evento final con `usage`. */
async function* parseSseStream(
  response: Response,
  provider: ProviderConfig,
  startedAt: number,
): AsyncGenerator<StreamChunk> {
  if (!response.body) {
    yield { type: "done", provider: provider.name, model: provider.model, latencyMs: Date.now() - startedAt };
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let usage: TokenUsage | undefined;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });

      // Los eventos SSE van separados por una línea en blanco.
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        for (const line of event.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) {
            continue;
          }
          const data = trimmed.slice("data:".length).trim();
          if (data === "[DONE]") {
            continue;
          }
          let parsed: OpenAiChatResponse;
          try {
            parsed = JSON.parse(data) as OpenAiChatResponse;
          } catch {
            continue; // fragmento aún incompleto o línea no-JSON
          }
          const text = parsed.choices?.[0]?.delta?.content;
          if (text) {
            yield { type: "delta", text };
          }
          if (parsed.usage) {
            usage = mapUsage(parsed.usage);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  yield {
    type: "done",
    provider: provider.name,
    model: provider.model,
    usage,
    latencyMs: Date.now() - startedAt,
  };
}

/**
 * Completa un chat con streaming. Emite `{ type: "delta" }` por cada fragmento de
 * texto y un `{ type: "done" }` final con `usage` y latencia. El fallback solo
 * aplica al inicio: una vez que empieza a emitir tokens, ya no se conmuta.
 */
export async function* streamChatCompletion(
  options: ChatCompletionOptions,
): AsyncGenerator<StreamChunk> {
  const startedAt = Date.now();
  const established = await callWithFallback(async (provider) => {
    const response = await fetchWithRetry(provider, buildPayload(provider, options, true), options.signal);
    return { provider, response };
  });
  yield* parseSseStream(established.response, established.provider, startedAt);
}

/** True si hay al menos un proveedor configurado (para healthcheck/diagnóstico). */
export function isAiConfigured(): boolean {
  return resolveProviders().length > 0;
}
