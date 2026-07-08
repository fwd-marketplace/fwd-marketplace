import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import type { CrearReporteInput } from "../validations/reporte";

/**
 * Reportes de mensajes del chat directo (moderación). Cualquier participante puede reportar un
 * mensaje ajeno; al hacerlo se guarda un SNAPSHOT del mensaje (contenido + autor + proyecto), porque
 * el admin no participa del chat y por RLS no puede leer mensajes privados. El admin revisa los
 * reportes y actúa con las acciones que ya existen (suspender cuenta / cancelar proyecto).
 */

/** Cuántos reportes devuelve el panel (los más recientes). */
const MAX_REPORTES = 100;

const PG_UNIQUE_VIOLATION = "23505";

export interface ReporteCreado {
  id: string;
  estado: string;
  fecha: string;
}

/**
 * Crea un reporte sobre un mensaje. El reportante debe poder ver el mensaje (RLS: participante o
 * mensaje público) y no puede reportar el suyo propio. Lanza 409 si ya lo reportó.
 */
export async function crearReporte(
  accessToken: string,
  userId: string,
  input: CrearReporteInput,
): Promise<ReporteCreado> {
  const client = supabaseForToken(accessToken);

  // 1. Cargar el mensaje con la identidad del reportante (RLS valida que pueda verlo).
  const { data: mensaje, error: msgError } = await client
    .from("mensaje")
    .select("id, contenido, id_remitente, id_proyecto")
    .eq("id", input.id_mensaje)
    .maybeSingle();
  if (msgError) throw new ApiError(500, msgError.message);
  if (!mensaje) throw new ApiError(404, "Mensaje no encontrado");
  if (mensaje.id_remitente === userId) {
    throw new ApiError(400, "No podés reportar tu propio mensaje");
  }

  // 2. Insertar el reporte con el snapshot del mensaje.
  const { data, error } = await client
    .from("mensaje_reporte")
    .insert({
      id_mensaje: mensaje.id,
      id_reportante: userId,
      id_reportado: mensaje.id_remitente,
      id_proyecto: mensaje.id_proyecto,
      contenido_snapshot: mensaje.contenido,
      motivo: input.motivo,
      detalle: input.detalle ?? null,
    })
    .select("id, estado, fecha")
    .single();
  if (error) {
    if (error.code === PG_UNIQUE_VIOLATION) {
      throw new ApiError(409, "Ya reportaste este mensaje");
    }
    throw new ApiError(400, error.message);
  }
  return data;
}

/** Datos de un usuario para mostrar en el panel de moderación. */
interface UsuarioMini {
  id: string;
  nombre: string;
  apellido1: string | null;
  correo: string;
}

/**
 * Lista los reportes para el panel de Moderación del admin (RLS: `reporte_ver_admin` via
 * `is_admin()`). Resuelve los nombres del reportante/reportado y el título del proyecto en
 * consultas aparte (mismo enfoque sin embeds anidados que `admin.service`).
 */
export async function listReportes(accessToken: string) {
  const client = supabaseForToken(accessToken);

  const { data: reportes, error } = await client
    .from("mensaje_reporte")
    .select(
      "id, contenido_snapshot, motivo, detalle, estado, fecha, fecha_resolucion, id_mensaje, id_reportante, id_reportado, id_proyecto",
    )
    .order("fecha", { ascending: false })
    .limit(MAX_REPORTES);
  if (error) throw new ApiError(500, error.message);

  const rows = reportes ?? [];
  if (rows.length === 0) return [];

  const userIds = [
    ...new Set(
      rows
        .flatMap((reporte) => [reporte.id_reportante, reporte.id_reportado])
        .filter((id): id is string => !!id),
    ),
  ];
  const proyectoIds = [
    ...new Set(rows.map((reporte) => reporte.id_proyecto).filter((id): id is string => !!id)),
  ];

  const usersById = new Map<string, UsuarioMini>();
  if (userIds.length > 0) {
    const { data: users, error: usersError } = await client
      .from("users")
      .select("id, nombre, apellido1, correo")
      .in("id", userIds);
    if (usersError) throw new ApiError(500, usersError.message);
    for (const user of users ?? []) {
      usersById.set(user.id, user);
    }
  }

  const proyectoById = new Map<string, { id: string; titulo: string }>();
  if (proyectoIds.length > 0) {
    const { data: proyectos, error: proyError } = await client
      .from("proyecto")
      .select("id, titulo")
      .in("id", proyectoIds);
    if (proyError) throw new ApiError(500, proyError.message);
    for (const proyecto of proyectos ?? []) {
      proyectoById.set(proyecto.id, proyecto);
    }
  }

  return rows.map((reporte) => ({
    ...reporte,
    reportante: usersById.get(reporte.id_reportante) ?? null,
    reportado: reporte.id_reportado ? (usersById.get(reporte.id_reportado) ?? null) : null,
    proyecto: reporte.id_proyecto ? (proyectoById.get(reporte.id_proyecto) ?? null) : null,
  }));
}

/** El admin resuelve un reporte: fija su estado, el admin que lo resolvió y la fecha. */
export async function resolverReporte(
  accessToken: string,
  adminUserId: string,
  reporteId: string,
  estado: "revisado" | "desestimado",
) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("mensaje_reporte")
    .update({
      estado,
      id_admin: adminUserId,
      fecha_resolucion: new Date().toISOString(),
    })
    .eq("id", reporteId)
    .select("id, estado, fecha_resolucion")
    .maybeSingle();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "Reporte no encontrado");
  return data;
}
