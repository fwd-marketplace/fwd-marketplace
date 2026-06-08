import { supabase } from "../config/supabase";
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

/** Valida un access_token de Supabase y devuelve el usuario asociado. */
export async function getUserFromToken(accessToken: string) {
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new ApiError(401, "Token inválido o expirado");
  }

  return data.user;
}
