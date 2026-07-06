import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

/** Resultado del cotejo de una cédula contra el registro externo de egresados FWD. */
export type EgresadoMatch =
  | { elegible: true; nombre: string; titulo: string; fechaEgreso: string | null }
  | { elegible: false };

/** Fila que devuelve la función `verificar_egresado` del registro externo. */
type RegistroRow = { nombre_completo: string; titulo: string; fecha_egreso: string | null };

/**
 * Coteja una cédula contra el registro externo de egresados FWD (un segundo proyecto
 * Supabase que simula la base oficial). Llama a la función `verificar_egresado` por la
 * API REST: la tabla está cerrada por RLS, así que solo se puede consultar una cédula
 * puntual, nunca volcar la lista completa. Devuelve el egresado si coincide (y está
 * activo), o `{ elegible: false }` si no está.
 *
 * Lanza ApiError si el registro no está configurado o no responde. Quien llama decide si
 * eso bloquea (endpoint público de verificación) o degrada (onboarding, que deja
 * 'pendiente' y sigue). La cédula puede venir con o sin guiones: la función la normaliza.
 */
export async function verificarEgresado(cedula: string): Promise<EgresadoMatch> {
  if (!env.registry.url || !env.registry.key) {
    throw new ApiError(503, "La verificación de egresados no está configurada");
  }

  let rows: RegistroRow[];
  try {
    const response = await fetch(`${env.registry.url}/rest/v1/rpc/verificar_egresado`, {
      method: "POST",
      headers: {
        apikey: env.registry.key,
        Authorization: `Bearer ${env.registry.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_cedula: cedula }),
    });
    if (!response.ok) {
      logger.error("registro de egresados respondió con error", { status: response.status });
      throw new ApiError(502, "El registro de egresados respondió con error");
    }
    rows = (await response.json()) as RegistroRow[];
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    logger.error("registro de egresados inaccesible", { error: (cause as Error).message });
    throw new ApiError(502, "No se pudo consultar el registro de egresados");
  }

  const match = rows[0];
  if (!match) return { elegible: false };

  return {
    elegible: true,
    nombre: match.nombre_completo,
    titulo: match.titulo,
    fechaEgreso: match.fecha_egreso,
  };
}
