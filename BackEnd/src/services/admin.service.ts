import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";

/**
 * Lista los usuarios con la cuenta en 'pendiente' (a la espera de aprobación).
 * Solo un admin puede leerlos (RLS: `users_admin_ver_todos` via `is_admin()`).
 */
export async function listPendingUsers(accessToken: string) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("users")
    .select("id, nombre, apellido1, correo, estado_cuenta, fecha_registro, role:roles(nombre)")
    .eq("estado_cuenta", "pendiente")
    .order("fecha_registro", { ascending: true });

  if (error) throw new ApiError(500, error.message);
  return data;
}

/** Estados válidos de `users.estado_cuenta` (coincide con el CHECK de la BD). */
type EstadoCuenta = "activa" | "pendiente" | "suspendida" | "rechazada";

/**
 * Cambia el estado de una cuenta. Solo admin (RLS: `users_admin_editar_todos`
 * via `is_admin()`). 404 si el usuario no existe. Base de approve/reject/suspend.
 */
async function setAccountState(accessToken: string, targetUserId: string, estado: EstadoCuenta) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("users")
    .update({ estado_cuenta: estado, updated_at: new Date().toISOString() })
    .eq("id", targetUserId)
    .select("id, estado_cuenta")
    .maybeSingle();

  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "Usuario no encontrado");
  return data;
}

/** Aprueba una cuenta: estado_cuenta -> 'activa'. */
export function approveUser(accessToken: string, targetUserId: string) {
  return setAccountState(accessToken, targetUserId, "activa");
}

/** Rechaza una cuenta pendiente: estado_cuenta -> 'rechazada'. */
export function rejectUser(accessToken: string, targetUserId: string) {
  return setAccountState(accessToken, targetUserId, "rechazada");
}

/** Suspende una cuenta activa: estado_cuenta -> 'suspendida'. */
export function suspendUser(accessToken: string, targetUserId: string) {
  return setAccountState(accessToken, targetUserId, "suspendida");
}

/**
 * Lista todos los proyectos para moderación (incluye borradores).
 * Solo admin (RLS: `proyecto_admin_ver`).
 */
export async function listAllProjects(accessToken: string) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("proyecto")
    .select(
      "id, titulo, fecha_publicacion, estado:estado_proyecto(nombre), empresa:empresario(nombre_comercial, tipo)",
    )
    .order("fecha_publicacion", { ascending: false, nullsFirst: false });

  if (error) throw new ApiError(500, error.message);
  return data;
}

/**
 * Modera un proyecto cancelándolo: estado -> 'cancelado'. Solo admin
 * (RLS: `proyecto_admin_moderar`). 404 si el proyecto no existe.
 */
export async function cancelProject(accessToken: string, projectId: string) {
  const client = supabaseForToken(accessToken);

  const { data: estado, error: estadoError } = await client
    .from("estado_proyecto")
    .select("id")
    .eq("nombre", "cancelado")
    .maybeSingle();
  if (estadoError) throw new ApiError(500, estadoError.message);
  if (!estado) throw new ApiError(500, "Falta el estado 'cancelado' (seeds no aplicados)");

  const { data, error } = await client
    .from("proyecto")
    .update({ id_estado: estado.id })
    .eq("id", projectId)
    .select("id, estado:estado_proyecto(nombre)")
    .maybeSingle();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "Proyecto no encontrado");
  return data;
}
