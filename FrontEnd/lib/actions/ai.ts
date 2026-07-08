"use server";

import { getLocale } from "next-intl/server";
import { generateProposal, mejorarMensaje, suggestStack, suggestCompensacion, suggestCotizacion } from "@/lib/api/ai";
import { toAiLocale } from "@/lib/api/ai-client";
import type {
  AiChatMessage,
  SuggestStackInput,
  SuggestCompensacionInput,
  SuggestCotizacionInput,
} from "@/lib/api/types";

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

/** Sugiere un pago total en USD para el formulario manual a partir de la descripción del proyecto. */
export async function suggestCompensacionAction(input: SuggestCompensacionInput) {
  const locale = await getLocale();
  return suggestCompensacion(input, toAiLocale(locale));
}

/** Sugiere cómo llenar la calculadora de cotización del junior a partir de la descripción. */
export async function suggestCotizacionAction(input: SuggestCotizacionInput) {
  const locale = await getLocale();
  return suggestCotizacion(input, toAiLocale(locale));
}

/** Reescribe el borrador de la empresa para el chat con un junior (no lo envía: solo sugiere). */
export async function mejorarMensajeAction(borrador: string, proyectoId?: string) {
  return mejorarMensaje(borrador, proyectoId);
}
