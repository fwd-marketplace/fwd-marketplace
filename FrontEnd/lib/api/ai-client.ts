import type { AiChatMessage } from "@/lib/api/types";

/**
 * Cliente del asistente para componentes de cliente (no usa `next/headers`).
 * Llama al route handler `/api/ai/asistente` (mismo origen, envía la cookie de
 * sesión automáticamente) y parsea el streaming SSE, emitiendo cada fragmento.
 */

export type AiStreamEvent =
  | { type: "delta"; text: string }
  | { type: "done" }
  | { type: "error"; error: string };

const ASSISTANT_ENDPOINT = "/api/ai/asistente";
const DEFAULT_ERROR = "No se pudo contactar al asistente de IA.";

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
 * Envía el historial al asistente y va emitiendo los fragmentos de texto.
 * Resuelve cuando el stream termina. Nunca lanza por errores del proveedor:
 * los reporta como un evento `error` para que la UI degrade al formulario.
 */
export async function streamAssistant(
  history: AiChatMessage[],
  onEvent: (event: AiStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(ASSISTANT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history }),
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
