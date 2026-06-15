import { supabase, supabaseForToken, createEphemeralClient } from "../config/supabase";
import { ApiError } from "../utils/ApiError";

type RegisterInput = { email: string; password: string; name?: string };
type LoginInput = { email: string; password: string };

/**
 * Registro mediante Supabase Auth. Crea el usuario en `auth.users`.
 * Según la config del proyecto puede requerir confirmación por email
 * (en ese caso `session` llega como null y no hay token todavía).
 */
export async function registerUser(input: RegisterInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: input.name ? { data: { name: input.name } } : undefined,
  });

  if (error) {
    throw new ApiError(error.status ?? 400, error.message);
  }

  return { user: data.user, session: data.session };
}

/**
 * Login mediante Supabase Auth. Devuelve el usuario y la sesión,
 * cuyo `access_token` es el JWT que el FrontEnd usará en las siguientes
 * peticiones (cabecera Authorization: Bearer <access_token>).
 */
export async function loginUser(input: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    throw new ApiError(error.status ?? 401, error.message);
  }

  return { user: data.user, session: data.session };
}

/**
 * Renueva la sesión a partir de un `refresh_token` válido. Devuelve la misma
 * forma que login (`user` + `session`) con un `access_token` nuevo. El FrontEnd
 * la usa cuando el access_token expira (~1h) para no mandar al usuario a login.
 */
export async function refreshSession(refreshToken: string) {
  const client = createEphemeralClient();
  const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken });

  if (error || !data.session) {
    throw new ApiError(error?.status ?? 401, error?.message ?? "Refresh token inválido o expirado");
  }

  return { user: data.user, session: data.session };
}

/**
 * Cierra la sesión revocando el `refresh_token` en Supabase Auth. Idempotente:
 * si el token ya es inválido o expiró, no hay nada que revocar y se considera
 * logout exitoso. El `access_token` es un JWT sin estado: expira por sí solo
 * (~1h) y no se revoca aquí.
 */
export async function logoutUser(refreshToken: string) {
  const client = createEphemeralClient();
  const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken });

  // Si no se pudo establecer sesión, ya no hay nada activo que cerrar.
  if (error || !data.session) return;

  // signOut revoca el refresh token de la sesión recién obtenida.
  await client.auth.signOut();
}

/** Valida un access_token de Supabase y devuelve el usuario asociado. */
export async function getUserFromToken(accessToken: string) {
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new ApiError(401, "Token inválido o expirado");
  }

  return data.user;
}

/**
 * Devuelve el perfil del usuario en la BD (fila `users` + nombre del rol),
 * o `null` si todavía no completó el onboarding. Usa el cliente con la
 * identidad del usuario para que el RLS resuelva `auth.uid()`.
 */
export async function getMyProfile(accessToken: string, userId: string) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("users")
    .select(
      "id, nombre, apellido1, apellido2, cedula, correo, estado_cuenta, fecha_registro, role:roles(nombre)",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message);
  return data;
}
