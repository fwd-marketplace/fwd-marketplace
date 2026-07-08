import { ApiError, apiAuth } from "@/lib/api-client";
import { err, ok, type Result } from "@/lib/result";
import type {
  AiChatMessage,
  AiLocale,
  CompensacionSuggestion,
  CotizacionSuggestion,
  GenerateProposalResponse,
  ProjectProposal,
  StackSuggestion,
  SuggestCompensacionInput,
  SuggestCompensacionResponse,
  SuggestCotizacionInput,
  SuggestCotizacionResponse,
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
export function generateProposal(
  history: AiChatMessage[],
  locale: AiLocale,
): Promise<Result<ProjectProposal>> {
  return asResult(async () => {
    const response = await apiAuth<GenerateProposalResponse>("/ai/generar-propuesta", {
      method: "POST",
      body: JSON.stringify({ history, locale }),
    });
    return response.propuesta;
  });
}

/** Sugiere habilidades del catálogo para el formulario manual (no es streaming). */
export function suggestStack(
  input: SuggestStackInput,
  locale: AiLocale,
): Promise<Result<StackSuggestion>> {
  return asResult(async () => {
    const response = await apiAuth<SuggestStackResponse>("/ai/sugerir-stack", {
      method: "POST",
      body: JSON.stringify({ ...input, locale }),
    });
    return response.sugerencia;
  });
}

/** Sugiere un pago total en USD para el formulario manual (no es streaming). */
export function suggestCompensacion(
  input: SuggestCompensacionInput,
  locale: AiLocale,
): Promise<Result<CompensacionSuggestion>> {
  return asResult(async () => {
    const response = await apiAuth<SuggestCompensacionResponse>("/ai/sugerir-compensacion", {
      method: "POST",
      body: JSON.stringify({ ...input, locale }),
    });
    return response.sugerencia;
  });
}

/**
 * Sugiere cómo llenar la calculadora de cotización del junior a partir de la descripción del
 * proyecto (no es streaming). El monto final lo calcula la lógica pura del FrontEnd con estos campos.
 */
export function suggestCotizacion(
  input: SuggestCotizacionInput,
  locale: AiLocale,
): Promise<Result<CotizacionSuggestion>> {
  return asResult(async () => {
    const response = await apiAuth<SuggestCotizacionResponse>("/ai/sugerir-cotizacion", {
      method: "POST",
      body: JSON.stringify({ ...input, locale }),
    });
    return response.sugerencia;
  });
}

/**
 * Reescribe el borrador de un mensaje de la empresa (chat con un junior) para que quede más claro
 * y profesional. `proyectoId` aporta contexto técnico. Devuelve el texto sugerido (no envía nada).
 */
export function mejorarMensaje(borrador: string, proyectoId?: string): Promise<Result<string>> {
  return asResult(async () => {
    const body: Record<string, unknown> = { borrador };
    if (proyectoId) {
      body.proyecto_id = proyectoId;
    }
    const response = await apiAuth<{ mejorado: string }>("/ai/mejorar-mensaje", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return response.mejorado;
  });
}
