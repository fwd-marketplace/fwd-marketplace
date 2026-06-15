import type { ZodType } from "zod";
import { ApiError } from "./ApiError";

/**
 * Valida `body` contra un schema Zod y devuelve el dato tipado.
 * Si falla, lanza `ApiError(400)` con un mensaje legible (no el stack de Zod).
 */
export function parseBody<T>(schema: ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
      .join("; ");
    throw new ApiError(400, message || "Datos inválidos");
  }
  return result.data;
}
