"use server";

import { generateProposal, mejorarMensaje, suggestStack } from "@/lib/api/ai";
import type { AiChatMessage, SuggestStackInput } from "@/lib/api/types";

/**
 * Genera la propuesta del asistente a partir del historial conversacional.
 * Server action: corre en el servidor y usa la cookie httpOnly de sesión.
 */
export async function generateProposalAction(history: AiChatMessage[]) {
  return generateProposal(history);
}

/** Sugiere el stack para el formulario manual a partir de la descripción del proyecto. */
export async function suggestStackAction(input: SuggestStackInput) {
  return suggestStack(input);
}

/** Reescribe el borrador de la empresa para el chat con un junior (no lo envía: solo sugiere). */
export async function mejorarMensajeAction(borrador: string, proyectoId?: string) {
  return mejorarMensaje(borrador, proyectoId);
}
