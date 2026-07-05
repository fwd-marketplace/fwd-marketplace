import { supabaseForToken } from "../../config/supabase";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";
import type { AppLocale } from "../../validations/ai";
import { buildSystemPromptChatProyecto, type ProyectoContexto } from "./prompts";
import { streamChatCompletion, type ChatMessage, type StreamChunk } from "./provider";

/**
 * Chatbot del proyecto (Nivel 0 del flujo de contacto): responde dudas de un junior sobre UN
 * proyecto concreto, anclado a su contexto (RAG por inyección de contexto, no fine-tuning).
 * Es stateless igual que el asistente de creación: el FrontEnd reenvía el historial en cada
 * turno y el BackEnd antepone el system prompt. Cuando no puede responder, el modelo añade la
 * etiqueta de escalamiento y el FrontEnd ofrece "Hablar con la empresa".
 */

// Algo bajo para respuestas consistentes y ancladas al contexto, sin sonar robótico.
const TEMPERATURE_CHAT = 0.4;
// Respuestas breves (2-5 frases): acota costo y mantiene el tono conversacional.
const MAX_TOKENS_CHAT = 600;

export interface ChatProyectoParams {
  proyectoId: string;
  history: ChatMessage[];
  userId: string;
  accessToken: string;
  /** Idioma en el que debe responder la IA (locale del junior). */
  locale: AppLocale;
  signal?: AbortSignal;
}

/**
 * Carga el contexto de UN proyecto para anclar las respuestas del bot. La visibilidad la
 * garantiza el RLS (solo proyectos publicados o propios); si no es visible, devuelve 404.
 * Unifica las skills del catálogo con las `tecnologias_extra` escritas por la empresa.
 */
async function loadProyectoContexto(
  accessToken: string,
  proyectoId: string,
): Promise<ProyectoContexto> {
  const client = supabaseForToken(accessToken);

  const { data, error } = await client
    .from("proyecto")
    .select(
      `titulo, descripcion, condiciones, usa_ia, plazo_dias, tecnologias_extra, compensacion, moneda,
       area:area_negocio(nombre),
       empresa:empresario(nombre_comercial),
       skills:project_skills(skill:skills(nombre))`,
    )
    .eq("id", proyectoId)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(404, "Proyecto no encontrado");

  const skillNames = (data.skills ?? [])
    .map((row) => row.skill?.nombre)
    .filter((nombre): nombre is string => !!nombre);
  const tecnologias = [...new Set([...skillNames, ...(data.tecnologias_extra ?? [])])];

  return {
    titulo: data.titulo,
    empresa: data.empresa?.nombre_comercial ?? null,
    area: data.area?.nombre ?? null,
    plazoDias: data.plazo_dias,
    compensacion: data.compensacion,
    moneda: data.moneda,
    descripcion: data.descripcion,
    usaIa: data.usa_ia,
    tecnologias,
    // "Condiciones y preguntas frecuentes" que cargó la empresa (vacío -> null para omitir del prompt).
    condiciones: data.condiciones.trim() ? data.condiciones : null,
  };
}

/**
 * Turno conversacional con streaming. Carga el contexto del proyecto, antepone el system prompt
 * al historial del FrontEnd y reemite los fragmentos del proveedor. En el evento final registra
 * el uso (tokens/latencia) sin guardar el contenido de la conversación.
 */
export async function* streamChatProyecto(params: ChatProyectoParams): AsyncGenerator<StreamChunk> {
  const contexto = await loadProyectoContexto(params.accessToken, params.proyectoId);

  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPromptChatProyecto(contexto, params.locale) },
    ...params.history,
  ];

  for await (const chunk of streamChatCompletion({
    messages,
    temperature: TEMPERATURE_CHAT,
    maxTokens: MAX_TOKENS_CHAT,
    signal: params.signal,
  })) {
    if (chunk.type === "done") {
      logger.info("ai_usage", {
        userId: params.userId,
        action: "chat_proyecto",
        proyectoId: params.proyectoId,
        provider: chunk.provider,
        model: chunk.model,
        totalTokens: chunk.usage?.totalTokens ?? null,
        latencyMs: chunk.latencyMs,
      });
    }
    yield chunk;
  }
}
