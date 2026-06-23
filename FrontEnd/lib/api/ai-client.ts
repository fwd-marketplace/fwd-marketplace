import type { AiChatMessage, AiLocale } from "@/lib/api/types";

/**
 * Cliente de IA para componentes de cliente (no usa `next/headers`). Llama a los route handlers
 * locales (mismo origen, envían la cookie de sesión automáticamente) y parsea el streaming SSE,
 * emitiendo cada fragmento. Cubre el asistente de creación de proyectos y el chatbot del proyecto.
 */

export type AiStreamEvent =
  | { type: "delta"; text: string }
  | { type: "done" }
  | { type: "error"; error: string };

/** Reduce el locale de next-intl (string) al idioma soportado por la IA. */
export function toAiLocale(locale: string): AiLocale {
  return locale === "en" ? "en" : "es";
}

const ASSISTANT_ENDPOINT = "/api/ai/asistente";
const DEFAULT_ERROR = "No se pudo contactar al asistente de IA.";

/**
 * Etiqueta que el chatbot del proyecto agrega al final cuando recomienda derivar a la empresa.
 * El widget la detecta para resaltar el botón "Hablar con la empresa" y la quita del texto visible.
 * Debe coincidir con `ESCALATION_TAG` del BackEnd (`services/ai/prompts.ts`).
 */
export const ESCALATION_TAG = "[[ESCALAR]]";

/** Parsea un bloque de evento SSE en { event, data }. */
function parseSseEvent(raw: string): { event: string; data: string } {
  let event = "message";
  let data = "";
  for (const line of raw.split("\n")) {
    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim();
    } else if (line.startsWith("data:")) {
      data += line.slice("data:".length).trim();
    }
  }
  return { event, data };
}

function emitFromSse(raw: string, onEvent: (event: AiStreamEvent) => void): void {
  const { event, data } = parseSseEvent(raw);
  if (!data) {
    return;
  }
  if (event === "delta") {
    try {
      const parsed = JSON.parse(data) as { text?: string };
      if (parsed.text) {
        onEvent({ type: "delta", text: parsed.text });
      }
    } catch {
      // fragmento no parseable: se ignora.
    }
  } else if (event === "done") {
    onEvent({ type: "done" });
  } else if (event === "error") {
    let message = DEFAULT_ERROR;
    try {
      const parsed = JSON.parse(data) as { error?: string };
      if (parsed.error) message = parsed.error;
    } catch {
      // se usa el mensaje por defecto.
    }
    onEvent({ type: "error", error: message });
  }
}

/**
 * POST a un route handler de IA con streaming y emisión de fragmentos. Resuelve cuando el stream
 * termina. Nunca lanza por errores del proveedor: los reporta como un evento `error` para que la
 * UI degrade con elegancia.
 */
async function streamFromEndpoint(
  endpoint: string,
  history: AiChatMessage[],
  locale: AiLocale,
  onEvent: (event: AiStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history, locale }),
      signal: signal ?? null,
    });
  } catch (error) {
    if (signal?.aborted) {
      return;
    }
    onEvent({ type: "error", error: error instanceof Error ? error.message : DEFAULT_ERROR });
    return;
  }

  if (!response.ok || !response.body) {
    let message = DEFAULT_ERROR;
    try {
      const parsed = (await response.json()) as { error?: string };
      if (parsed.error) message = parsed.error;
    } catch {
      // se usa el mensaje por defecto.
    }
    onEvent({ type: "error", error: message });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";
      for (const raw of events) {
        emitFromSse(raw, onEvent);
      }
    }
  } catch (error) {
    if (!signal?.aborted) {
      onEvent({ type: "error", error: error instanceof Error ? error.message : DEFAULT_ERROR });
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Envía el historial al asistente de creación de proyectos y va emitiendo los fragmentos de texto.
 */
export function streamAssistant(
  history: AiChatMessage[],
  locale: AiLocale,
  onEvent: (event: AiStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  return streamFromEndpoint(ASSISTANT_ENDPOINT, history, locale, onEvent, signal);
}

/**
 * Envía el historial al chatbot de un proyecto concreto (dudas del junior antes de postular) y va
 * emitiendo los fragmentos. El BackEnd ancla las respuestas al proyecto `projectId`.
 */
export function streamProjectChatbot(
  projectId: string,
  history: AiChatMessage[],
  locale: AiLocale,
  onEvent: (event: AiStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  return streamFromEndpoint(`/api/ai/chat-proyecto/${projectId}`, history, locale, onEvent, signal);
}
