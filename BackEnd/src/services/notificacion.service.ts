import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

/**
 * Tipo de notificacion usado para los agradecimientos/avisos de cambio de estado.
 * Reusa uno de los valores permitidos por el CHECK de la tabla `notificacion` y por
 * `users.preferencias_notificacion` (ver migracion 0005), para no ampliar el CHECK.
 */
const TIPO_CAMBIO_ESTADO = "cambio_estado";

/** Cuantas notificaciones se devuelven en el listado (las mas recientes). */
const MAX_NOTIFICACIONES = 50;

/**
 * Textos de las notificaciones de agradecimiento/aviso (se guardan tal cual en la
 * BD). Quedan centralizados para mantener un tono consistente y calido.
 */
export const MENSAJES_NOTIFICACION = {
  postulacionRechazada: (titulo: string): string =>
    `Gracias por postular a "${titulo}". En esta ocasión la empresa eligió otra propuesta; seguí participando, hay más oportunidades.`,
  proyectoCerrado: (titulo: string): string =>
    `Gracias por tu trabajo en "${titulo}". El proyecto se cerró con éxito.`,
  proyectoEliminado: (titulo: string): string =>
    `El proyecto "${titulo}" fue retirado por la empresa. Gracias por tu interés.`,
} as const;

/**
 * Crea una notificacion para otro usuario (best-effort). La empresa no puede
 * insertar en `notificacion` directamente (RLS sin politica de INSERT), asi que se
 * usa la RPC `crear_notificacion` (SECURITY DEFINER, migracion 0029), que valida el
 * permiso y respeta las preferencias del destinatario. Si falla, se registra y se
 * sigue: una notificacion nunca debe romper la operacion que la dispara.
 */
export async function crearNotificacion(
  accessToken: string,
  destinatarioUserId: string,
  mensaje: string,
): Promise<void> {
  try {
    const client = supabaseForToken(accessToken);
    const { error } = await client.rpc("crear_notificacion", {
      p_id_usuario: destinatarioUserId,
      p_tipo: TIPO_CAMBIO_ESTADO,
      p_mensaje: mensaje,
    });
    if (error) {
      logger.warn("crear_notificacion fallo (best-effort)", {
        error: error.message,
        code: error.code,
      });
    }
  } catch (error) {
    logger.warn("crear_notificacion lanzo (best-effort)", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/** Crea la misma notificacion para varios destinatarios (best-effort, en paralelo). */
export async function crearNotificaciones(
  accessToken: string,
  destinatarioUserIds: string[],
  mensaje: string,
): Promise<void> {
  await Promise.all(
    destinatarioUserIds.map((userId) => crearNotificacion(accessToken, userId, mensaje)),
  );
}

/** Lista las notificaciones del usuario autenticado, mas recientes primero. */
export async function listMyNotificaciones(accessToken: string, userId: string) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("notificacion")
    .select("id, tipo, mensaje, leida, fecha")
    .eq("id_usuario", userId)
    .order("fecha", { ascending: false })
    .limit(MAX_NOTIFICACIONES);
  if (error) throw new ApiError(500, error.message);
  return data;
}

/** Marca una notificacion propia como leida. 404 si no existe o no es del usuario. */
export async function marcarLeida(accessToken: string, userId: string, notificacionId: string) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("notificacion")
    .update({ leida: true })
    .eq("id", notificacionId)
    .eq("id_usuario", userId)
    .select("id, leida")
    .maybeSingle();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "Notificación no encontrada");
  return data;
}

/** Marca todas las notificaciones no leidas del usuario como leidas. */
export async function marcarTodasLeidas(
  accessToken: string,
  userId: string,
): Promise<{ ok: true }> {
  const client = supabaseForToken(accessToken);
  const { error } = await client
    .from("notificacion")
    .update({ leida: true })
    .eq("id_usuario", userId)
    .eq("leida", false);
  if (error) throw new ApiError(400, error.message);
  return { ok: true };
}
