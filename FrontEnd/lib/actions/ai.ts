"use server";

import { generateProposal } from "@/lib/api/ai";
import type { AiChatMessage } from "@/lib/api/types";

/**
 * Genera la propuesta del asistente a partir del historial conversacional.
 * Server action: corre en el servidor y usa la cookie httpOnly de sesión.
 */
export async function generateProposalAction(history: AiChatMessage[]) {
  return generateProposal(history);
}
