import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { parseBody } from "../utils/parseBody";
import { AsistenteRequestSchema } from "../validations/ai";
import {
  streamAsistente,
  generarPropuesta as generarPropuestaService,
} from "../services/ai/asistente.service";

/** Escribe un evento SSE (`event:` + `data:` JSON) en la respuesta. */
function writeSseEvent(res: Response, event: string, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/**
 * POST /api/ai/asistente-proyecto
 *
 * Turno conversacional con streaming (SSE). Recibe el historial completo (la API
 * no tiene memoria) y emite eventos `delta` con el texto y un `done` final. Si el
 * proveedor falla a mitad, emite un `error` y cierra: el FrontEnd degrada al
 * formulario manual.
 */
export async function asistenteProyecto(req: Request, res: Response): Promise<void> {
  if (!req.user || !req.accessToken) {
    throw new ApiError(401, "No autenticado");
  }
  // Capturamos antes de abrir el stream: la validación puede lanzar 400 (JSON).
  const userId = req.user.id;
  const accessToken = req.accessToken;
  const { history } = parseBody(AsistenteRequestSchema, req.body);

  // A partir de aquí ya no se puede responder con JSON: todo va por SSE.
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  // Evita el buffering de proxies (nginx) que romperían el streaming.
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Si el cliente cierra la pestaña/conexión, abortamos la llamada al proveedor.
  const abortController = new AbortController();
  req.on("close", () => abortController.abort());

  try {
    for await (const chunk of streamAsistente({
      history,
      userId,
      accessToken,
      signal: abortController.signal,
    })) {
      if (chunk.type === "delta") {
        writeSseEvent(res, "delta", { text: chunk.text });
      } else {
        writeSseEvent(res, "done", { usage: chunk.usage ?? null });
      }
    }
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "No se pudo contactar al asistente de IA. Probá completar el formulario manualmente.";
    logger.error("ai_asistente_stream_error", {
      error: error instanceof Error ? error.message : String(error),
    });
    if (!res.writableEnded) {
      writeSseEvent(res, "error", { error: message });
    }
  } finally {
    if (!res.writableEnded) {
      res.end();
    }
  }
}

/**
 * POST /api/ai/generar-propuesta
 *
 * A partir de la conversación devuelve el JSON estructurado de la propuesta,
 * mapeado al formulario (con ids de área y habilidades ya resueltos).
 */
export async function generarPropuesta(req: Request, res: Response): Promise<void> {
  if (!req.user || !req.accessToken) {
    throw new ApiError(401, "No autenticado");
  }
  const { history } = parseBody(AsistenteRequestSchema, req.body);

  const propuesta = await generarPropuestaService({
    history,
    userId: req.user.id,
    accessToken: req.accessToken,
  });

  res.status(200).json({ propuesta });
}
