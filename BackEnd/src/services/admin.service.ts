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

/**
 * Aprueba una cuenta: estado_cuenta -> 'activa'. Solo admin (RLS:
 * `users_admin_editar_todos`). 404 si el usuario no existe.
 */
export async function approveUser(accessToken: string, targetUserId: string) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("users")
    .update({ estado_cuenta: "activa", updated_at: new Date().toISOString() })
    .eq("id", targetUserId)
    .select("id, estado_cuenta")
    .maybeSingle();

  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, "Usuario no encontrado");
  return data;
}
