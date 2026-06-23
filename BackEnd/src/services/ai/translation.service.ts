import { logger } from "../../utils/logger";
import type { AppLocale } from "../../validations/ai";
import { createChatCompletion, type ChatMessage } from "./provider";

/**
 * Servicio de traducción es<->en reutilizando el proveedor de IA del proyecto (Groq/Gemini).
 * Se usa para "traducir al escribir": cuando se crea un proyecto o se envía un mensaje, se
 * traduce el contenido al idioma opuesto y se guarda, para mostrar luego "original + traducción".
 *
 * Todo es BEST-EFFORT: si el modelo falla o devuelve algo inválido, se devuelve `null` y el caller
 * decide (normalmente: guardar sin traducción y no mostrar el botón). Nunca lanza.
 */

// Baja temperatura: las traducciones deben ser consistentes y fieles, no creativas.
const TEMPERATURE_TRADUCCION = 0.2;

const LANGUAGE_NAME: Record<AppLocale, string> = {
  es: "Spanish (español)",
  en: "English",
};

/** System prompt del traductor: traduce solo los valores del JSON, conservando claves y formato. */
function buildTranslationSystemPrompt(from: AppLocale, to: AppLocale): string {
  return `You are a professional translator for a software talent marketplace. You receive a JSON
object whose values are texts written in ${LANGUAGE_NAME[from]} and you must translate every value
into ${LANGUAGE_NAME[to]}.

Rules:
- Respond ONLY with a valid JSON object, with no text before or after and no markdown fences.
- Keep EXACTLY the same keys as the input. Translate only the values.
- Preserve markdown formatting, line breaks, lists and headings exactly as they are.
- Do NOT translate proper nouns, brand or product names, technology names (React, Node.js, Figma,
  PostgreSQL...), code snippets, URLs or emails: leave them untouched.
- Do not add, remove or summarize content. Keep the meaning and the tone faithful.`;
}

/** Extrae el primer objeto JSON del texto, tolerando texto o markdown alrededor. */
function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  return text.slice(start, end + 1);
}

export interface TranslateFieldsParams {
  /** Campos a traducir (clave -> texto). Las claves se conservan en el resultado. */
  fields: Record<string, string>;
  from: AppLocale;
  to: AppLocale;
  signal?: AbortSignal;
}

/**
 * Traduce los valores de `fields` de `from` a `to`, conservando las claves. Los campos vacíos NO se
 * mandan al modelo (se devuelven vacíos). Devuelve `null` si origen y destino coinciden, si no hay
 * nada que traducir, o si el modelo falla / devuelve algo inválido o incompleto.
 */
export async function translateFields(
  params: TranslateFieldsParams,
): Promise<Record<string, string> | null> {
  const { fields, from, to } = params;
  if (from === to) {
    return null;
  }

  // Solo se traducen los campos con contenido real; los vacíos se preservan tal cual.
  const conContenido = Object.entries(fields).filter(([, value]) => value.trim().length > 0);
  if (conContenido.length === 0) {
    return null;
  }

  const messages: ChatMessage[] = [
    { role: "system", content: buildTranslationSystemPrompt(from, to) },
    { role: "user", content: JSON.stringify(Object.fromEntries(conContenido)) },
  ];

  let content: string;
  try {
    const completion = await createChatCompletion({
      messages,
      temperature: TEMPERATURE_TRADUCCION,
      json: true,
      signal: params.signal,
    });
    content = completion.content;
  } catch (error) {
    logger.warn("ai_traduccion_failed", {
      reason: error instanceof Error ? error.message : String(error),
    });
    return null;
  }

  const candidate = extractJsonObject(content);
  if (!candidate) {
    logger.warn("ai_traduccion_failed", { reason: "sin_objeto_json" });
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    logger.warn("ai_traduccion_failed", { reason: "json_invalido" });
    return null;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    logger.warn("ai_traduccion_failed", { reason: "forma_invalida" });
    return null;
  }

  // Se reconstruye con TODAS las claves originales: traducidas las que tenían contenido, vacías las
  // que estaban vacías. Si falta alguna traducción, se considera incompleta y se descarta entera.
  const fuente = parsed as Record<string, unknown>;
  const traducido: Record<string, string> = {};
  for (const [key, original] of Object.entries(fields)) {
    if (original.trim().length === 0) {
      traducido[key] = original;
      continue;
    }
    const valor = fuente[key];
    if (typeof valor !== "string" || valor.trim().length === 0) {
      logger.warn("ai_traduccion_failed", { reason: "campo_faltante", key });
      return null;
    }
    traducido[key] = valor;
  }
  return traducido;
}

/** Traduce un único texto de `from` a `to`. Best-effort: `null` si falla o no hay nada que traducir. */
export async function translateText(
  text: string,
  from: AppLocale,
  to: AppLocale,
  signal?: AbortSignal,
): Promise<string | null> {
  const result = await translateFields({ fields: { texto: text }, from, to, signal });
  return result?.texto ?? null;
}

/** Devuelve el idioma opuesto: el destino de la traducción que se guarda junto al original. */
export function oppositeLocale(locale: AppLocale): AppLocale {
  return locale === "es" ? "en" : "es";
}
