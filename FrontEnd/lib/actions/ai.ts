"use server";

import { getLocale } from "next-intl/server";
import { generateProposal, mejorarMensaje, suggestStack } from "@/lib/api/ai";
import type { AiChatMessage, AiLocale, SuggestStackInput } from "@/lib/api/types";

/** Reduce el locale de next-intl (string) al idioma soportado por la IA. */
function toAiLocale(locale: string): AiLocale {
  return locale === "en" ? "en" : "es";
}

/**
 * Genera la propuesta del asistente a partir del historial conversacional.
 * Server action: corre en el servidor y usa la cookie httpOnly de sesión.
 */
export async function generateProposalAction(history: AiChatMessage[]) {
  const locale = await getLocale();
  return generateProposal(history, toAiLocale(locale));
}

/** Sugiere el stack para el formulario manual a partir de la descripción del proyecto. */
export async function suggestStackAction(input: SuggestStackInput) {
  const locale = await getLocale();
  return suggestStack(input, toAiLocale(locale));
}

/** Reescribe el borrador de la empresa para el chat con un junior (no lo envía: solo sugiere). */
export async function mejorarMensajeAction(borrador: string, proyectoId?: string) {
  return mejorarMensaje(borrador, proyectoId);
}
