import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import { crearNotificacion, MENSAJES_NOTIFICACION, TIPO_POR_MENSAJE } from "./notificacion.service";

/**
 * La empresa invita a un estudiante verificado a postular a uno de sus proyectos
 * (desde el panel de match). Verifica que el proyecto sea suyo y esté recibiendo
 * propuestas, y que el invitado sea un estudiante verificado. Notifica al
 * estudiante con deep-link al proyecto (id_referencia = proyecto).
 */
export async function invitarEstudiante(
  accessToken: string,
  empresaUserId: string,
  projectId: string,
  juniorUserId: string,
): Promise<{ ok: true }> {
  const client = supabaseForToken(accessToken);

  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select("id, titulo, estado:estado_proyecto(nombre), empresa:empresario(id_usuario, nombre_comercial)")
    .eq("id", projectId)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (!proyecto) throw new ApiError(404, "Proyecto no encontrado");
  if (proyecto.empresa?.id_usuario !== empresaUserId) {
    throw new ApiError(403, "Este proyecto no es tuyo");
  }
  if (proyecto.estado?.nombre !== "en_recepcion") {
    throw new ApiError(409, "Solo podés invitar mientras el proyecto recibe propuestas");
  }

  // El invitado debe ser un estudiante verificado.
  const { data: estudiante, error: estError } = await client
    .from("estudiante")
    .select("id_usuario, estado_verificacion")
    .eq("id_usuario", juniorUserId)
    .maybeSingle();
  if (estError) throw new ApiError(500, estError.message);
  if (!estudiante || estudiante.estado_verificacion !== "verificado") {
    throw new ApiError(404, "Estudiante no encontrado o no verificado");
  }

  // Crear la invitación (el UNIQUE (proyecto, estudiante) evita duplicados).
  const { error: insError } = await client.from("invitacion").insert({
    id_proyecto: projectId,
    id_usuario: juniorUserId,
    id_empresa_usuario: empresaUserId,
  });
  if (insError) {
    if (insError.code === "23505") {
      throw new ApiError(409, "Ya invitaste a este estudiante a este proyecto");
    }
    throw new ApiError(400, insError.message);
  }

  // Notificar al estudiante (best-effort) con deep-link al proyecto.
  await crearNotificacion(
    accessToken,
    juniorUserId,
    MENSAJES_NOTIFICACION.invitacionProyecto(
      proyecto.empresa?.nombre_comercial ?? "Una empresa",
      proyecto.titulo,
    ),
    TIPO_POR_MENSAJE.invitacionProyecto,
    projectId,
  );

  return { ok: true };
}
