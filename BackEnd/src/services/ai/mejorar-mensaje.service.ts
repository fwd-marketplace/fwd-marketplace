import { supabaseForToken } from "../../config/supabase";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";
import { buildSystemPromptMejorarMensaje } from "./prompts";
import { createChatCompletion, type ChatMessage } from "./provider";

/**
 * "Mejorar mensaje" (Nivel 2 del flujo de contacto): la empresa escribe un borrador para
 * responderle a un junior en el chat y la IA lo reescribe más claro, profesional y cordial,
 * sin cambiar el significado ni inventar datos. Es un único turno (no streaming): devuelve el
 * texto mejorado para que la empresa lo revise y edite antes de enviarlo (nunca se envía solo).
 */

const TEMPERATURE_MEJORAR = 0.4;
const MAX_TOKENS_MEJORAR = 800;

export interface MejorarMensajeParams {
  borrador: string;
  /** Proyecto de la conversación; aporta contexto técnico al mensaje reescrito (best-effort). */
  proyectoId?: string;
  userId: string;
  accessToken: string;
  signal?: AbortSignal;
}

/**
 * Contexto ligero del proyecto (título, descripción, tecnologías) para que la reescritura pueda
 * precisar explicaciones técnicas. Best-effort: ante error o proyecto no visible, devuelve null
 * y la reescritura sigue sin contexto.
 */
async function loadContextoLigero(accessToken: string, proyectoId: string): Promise<string | null> {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("proyecto")
    .select("titulo, descripcion, tecnologias_extra, skills:project_skills(skill:skills(nombre))")
    .eq("id", proyectoId)
    .maybeSingle();
  if (error || !data) {
    if (error) {
      logger.warn("ai_mejorar_contexto_failed", { reason: error.message });
    }
    return null;
  }

  const skillNames = (data.skills ?? [])
    .map((row) => row.skill?.nombre)
    .filter((nombre): nombre is string => !!nombre);
  const tecnologias = [...new Set([...skillNames, ...(data.tecnologias_extra ?? [])])];

  const lineas = [`Título: ${data.titulo}`, `Descripción: ${data.descripcion}`];
  if (tecnologias.length > 0) {
    lineas.push(`Tecnologías: ${tecnologias.join(", ")}`);
  }
  return lineas.join("\n");
}

/** Reescribe el borrador de la empresa. Lanza 502 si el modelo no devuelve nada usable. */
export async function mejorarMensaje(params: MejorarMensajeParams): Promise<string> {
  let contexto: string | null = null;
  if (params.proyectoId) {
    try {
      contexto = await loadContextoLigero(params.accessToken, params.proyectoId);
    } catch (error) {
      logger.warn("ai_mejorar_contexto_failed", {
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPromptMejorarMensaje(contexto) },
    { role: "user", content: params.borrador },
  ];

  const completion = await createChatCompletion({
    messages,
    temperature: TEMPERATURE_MEJORAR,
    maxTokens: MAX_TOKENS_MEJORAR,
    signal: params.signal,
  });

  logger.info("ai_usage", {
    userId: params.userId,
    action: "mejorar_mensaje",
    provider: completion.provider,
    model: completion.model,
    totalTokens: completion.usage?.totalTokens ?? null,
    latencyMs: completion.latencyMs,
  });

  const mejorado = completion.content.trim();
  if (!mejorado) {
    throw new ApiError(502, "No se pudo mejorar el mensaje. Probá enviarlo como está.");
  }
  return mejorado;
}
