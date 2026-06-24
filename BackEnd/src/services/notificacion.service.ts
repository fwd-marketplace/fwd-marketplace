import { supabaseAdmin, supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

const TIPO_CAMBIO_ESTADO = "cambio_estado";
const TIPO_ADJUDICACION  = "adjudicacion";

/** Cuantas notificaciones se devuelven en el listado (las mas recientes). */
const MAX_NOTIFICACIONES = 50;

/** Tipos validos segun el CHECK de la tabla `notificacion`. */
export type TipoNotificacion =
  | "adjudicacion"
  | "vencimiento_plazo"
  | "nuevo_mensaje"
  | "entregable_subido"
  | "cambio_estado";

/**
 * Textos de las notificaciones (se guardan tal cual en la BD).
 * Quedan centralizados para mantener un tono consistente y calido.
 */
export const MENSAJES_NOTIFICACION = {
  // Empresa → recibe cuando un junior postula
  nuevaPostulacion: (titulo: string): string =>
    `Recibiste una nueva propuesta para tu proyecto "${titulo}". Revisala en el panel de gestión.`,
  // Junior → recibe cuando la empresa decide sobre su postulacion
  postulacionRechazada: (titulo: string): string =>
    `Gracias por postular a "${titulo}". En esta ocasión la empresa eligió otra propuesta; seguí participando, hay más oportunidades.`,
  postulacionAdjudicada: (titulo: string): string =>
    `Tu propuesta para "${titulo}" fue adjudicada. La empresa te eligió para llevar adelante el proyecto.`,
  cambiosSolicitados: (titulo: string): string =>
    `La empresa revisó tu propuesta para "${titulo}" y solicita algunos cambios antes de continuar.`,
  // Empresa → recibe cuando el junior sube un entregable
  entregableRecibido: (titulo: string): string =>
    `El junior subió un entregable para tu proyecto "${titulo}". Revisalo en el panel de gestión.`,
  // Empresa → recibe al adjudicar, para dar seguimiento al junior adjudicado
  seguimientoAdjudicacion: (titulo: string): string =>
    `Adjudicaste el proyecto "${titulo}". Dale seguimiento al junior: revisá su propuesta y entregables, y podés escribirle por correo desde el panel de gestión.`,
  // Junior → recibe cuando la empresa revisa su entregable
  entregableAprobado: (titulo: string): string =>
    `La empresa aprobó tu entregable para el proyecto "${titulo}". Bien hecho.`,
  entregableCambiosSolicitados: (titulo: string): string =>
    `La empresa solicitó cambios en tu entregable para "${titulo}". Revisá el comentario y subí una versión nueva.`,
  // Ambos → eventos de cierre/eliminación de proyecto
  proyectoCerrado: (titulo: string): string =>
    `Gracias por tu trabajo en "${titulo}". El proyecto se cerró con éxito.`,
  proyectoEliminado: (titulo: string): string =>
    `El proyecto "${titulo}" fue retirado por la empresa. Gracias por tu interés.`,
  // Mensaje nuevo (cualquier parte del chat)
  nuevoMensaje: (titulo: string): string =>
    `Recibiste un nuevo mensaje en el proyecto "${titulo}".`,
} as const;

/** Tipo por mensaje para el icono correcto en el panel. */
export const TIPO_POR_MENSAJE: Record<keyof typeof MENSAJES_NOTIFICACION, TipoNotificacion> = {
  nuevaPostulacion:             TIPO_CAMBIO_ESTADO,
  postulacionRechazada:         TIPO_CAMBIO_ESTADO,
  postulacionAdjudicada:        TIPO_ADJUDICACION,
  cambiosSolicitados:           TIPO_CAMBIO_ESTADO,
  entregableRecibido:           "entregable_subido",
  seguimientoAdjudicacion:      TIPO_ADJUDICACION,
  entregableAprobado:           TIPO_ADJUDICACION,
  entregableCambiosSolicitados: "entregable_subido",
  proyectoCerrado:              TIPO_ADJUDICACION,
  proyectoEliminado:            TIPO_CAMBIO_ESTADO,
  nuevoMensaje:                 "nuevo_mensaje" as TipoNotificacion,
} as const;

/**
 * Crea una notificacion usando supabaseAdmin (service role) para hacer el INSERT
 * directo en la tabla, respetando las preferencias del destinatario.
 * El RPC crear_notificacion del migration 0032 era necesario por RLS, pero el
 * cliente admin ya bypasea RLS — no necesitamos la RPC ni depender de auth.uid()
 * dentro de una funcion SECURITY DEFINER.
 * Best-effort: si falla, se loguea pero no rompe la operacion que la dispara.
 */
export async function crearNotificacion(
  _accessToken: string,
  destinatarioUserId: string,
  mensaje: string,
  tipo: TipoNotificacion = TIPO_CAMBIO_ESTADO,
  idReferencia: string | null = null,
): Promise<void> {
  try {
    const admin = supabaseAdmin();
    // Funcion SECURITY DEFINER (migracion 0034/0044): corre como postgres, bypasea RLS
    // y no depende de auth.uid(). Solo accesible via service_role (cliente admin).
    // p_id_referencia permite el deep-link (p.ej. al chat del proyecto).
    const { error } = await admin.rpc("sistema_crear_notificacion", {
      p_id_usuario: destinatarioUserId,
      p_tipo: tipo,
      p_mensaje: mensaje,
      p_id_referencia: idReferencia,
    });
    if (error) {
      logger.warn("sistema_crear_notificacion fallo (best-effort)", {
        error: error.message,
        code: error.code,
      });
    }
  } catch (err) {
    logger.warn("crear_notificacion lanzo (best-effort)", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/** Crea la misma notificacion para varios destinatarios (best-effort, en paralelo). */
export async function crearNotificaciones(
  accessToken: string,
  destinatarioUserIds: string[],
  mensaje: string,
  tipo: TipoNotificacion = TIPO_CAMBIO_ESTADO,
  idReferencia: string | null = null,
): Promise<void> {
  await Promise.all(
    destinatarioUserIds.map((userId) =>
      crearNotificacion(accessToken, userId, mensaje, tipo, idReferencia),
    ),
  );
}

/** Lista las notificaciones del usuario autenticado, mas recientes primero. */
export async function listMyNotificaciones(accessToken: string, userId: string) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("notificacion")
    .select("id, tipo, mensaje, leida, fecha, id_referencia")
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
