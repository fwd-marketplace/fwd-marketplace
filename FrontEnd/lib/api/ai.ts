import { ApiError, apiAuth } from "@/lib/api-client";
import { err, ok, type Result } from "@/lib/result";
import type {
  AiChatMessage,
  GenerateProposalResponse,
  ProjectProposal,
  StackSuggestion,
  SuggestStackInput,
  SuggestStackResponse,
} from "@/lib/api/types";

async function asResult<T>(operation: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await operation());
  } catch (error) {
    return err(error instanceof ApiError ? error.message : "Error de conexion");
  }
}

/**
 * Genera la propuesta estructurada a partir de la conversación. No es streaming
 * (devuelve el JSON final). El turno conversacional sí va por streaming a través
 * del route handler `/api/ai/asistente`.
 */
export function generateProposal(history: AiChatMessage[]): Promise<Result<ProjectProposal>> {
  return asResult(async () => {
    const response = await apiAuth<GenerateProposalResponse>("/ai/generar-propuesta", {
      method: "POST",
      body: JSON.stringify({ history }),
    });
    return response.propuesta;
  });
}

/** Sugiere habilidades del catálogo para el formulario manual (no es streaming). */
export function suggestStack(input: SuggestStackInput): Promise<Result<StackSuggestion>> {
  return asResult(async () => {
    const response = await apiAuth<SuggestStackResponse>("/ai/sugerir-stack", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return response.sugerencia;
  });
}
