import { supabase, supabaseForToken, createEphemeralClient } from "../config/supabase";
import { env } from "../config/env";
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

/**
 * Paso 1 de recuperación: envía el correo con el enlace de recovery. El enlace
 * lleva a la página donde el usuario define la clave nueva. No revela si el
 * correo existe (respuesta uniforme); solo falla si el proveedor de correo cae.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const redirectTo = `${env.frontendUrl}/es/nueva-contrasena`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error && error.status && error.status >= 500) {
    throw new ApiError(502, "No se pudo enviar el correo de recuperación");
  }
}

/**
 * Paso 2 de recuperación: confirma el cambio con el `token_hash` que viene en el
 * enlace del correo. Verifica el OTP de tipo 'recovery' (que abre una sesión
 * temporal) y con esa sesión actualiza la contraseña. Cliente efímero para no
 * contaminar el cliente compartido.
 */
export async function confirmPasswordReset(tokenHash: string, newPassword: string): Promise<void> {
  const client = createEphemeralClient();

  const { data, error } = await client.auth.verifyOtp({
    token_hash: tokenHash,
    type: "recovery",
  });
  if (error || !data.session) {
    throw new ApiError(400, "El enlace de recuperación es inválido o expiró");
  }

  const { error: updateError } = await client.auth.updateUser({ password: newPassword });
  if (updateError) {
    throw new ApiError(400, updateError.message);
  }
}

/** Valida un access_token de Supabase y devuelve el usuario asociado. */
export async function getUserFromToken(accessToken: string) {
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new ApiError(401, "Token inválido o expirado");
  }

  return data.user;
}

/** Columnas de `estudiante` que muestra la página de perfil del junior. */
const ESTUDIANTE_DETAIL_SELECT =
  "id, descripcion, especialidad, modalidad_preferida, disponibilidad, titulo_fwd, reputacion, url_avatar, url_github, url_linkedin, url_portfolio";

/** Nombres de las skills de un estudiante (catálogo `skills` vía `student_skills`). */
async function getEstudianteSkills(
  client: ReturnType<typeof supabaseForToken>,
  estudianteId: string,
): Promise<string[]> {
  const { data: links, error: linksError } = await client
    .from("student_skills")
    .select("id_skill")
    .eq("id_estudiante", estudianteId);
  if (linksError) throw new ApiError(500, linksError.message);

  const skillIds = (links ?? []).map((link) => link.id_skill);
  if (skillIds.length === 0) return [];

  const { data: skills, error: skillsError } = await client
    .from("skills")
    .select("nombre")
    .in("id", skillIds);
  if (skillsError) throw new ApiError(500, skillsError.message);

  return (skills ?? []).map((skill) => skill.nombre);
}

/**
 * Devuelve el perfil del usuario en la BD (fila `users` + nombre del rol),
 * o `null` si todavía no completó el onboarding. Para el junior anida además
 * los datos de su fila `estudiante` y sus skills, que son los que muestra la
 * página de perfil. Usa el cliente con la identidad del usuario para que el
 * RLS resuelva `auth.uid()`.
 */
export async function getMyProfile(accessToken: string, userId: string) {
  const client = supabaseForToken(accessToken);
  const { data: user, error } = await client
    .from("users")
    .select(
      "id, nombre, apellido1, apellido2, cedula, correo, estado_cuenta, fecha_registro, role:roles(nombre)",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message);
  if (!user) return null;

  if (user.role?.nombre === "student") {
    const { data: estudiante, error: estudianteError } = await client
      .from("estudiante")
      .select(ESTUDIANTE_DETAIL_SELECT)
      .eq("id_usuario", userId)
      .maybeSingle();
    if (estudianteError) throw new ApiError(500, estudianteError.message);
    if (!estudiante) return { ...user, estudiante: null };

    const skills = await getEstudianteSkills(client, estudiante.id);
    return {
      ...user,
      estudiante: {
        descripcion: estudiante.descripcion,
        especialidad: estudiante.especialidad,
        modalidad_preferida: estudiante.modalidad_preferida,
        disponibilidad: estudiante.disponibilidad,
        titulo_fwd: estudiante.titulo_fwd,
        reputacion: estudiante.reputacion,
        url_avatar: estudiante.url_avatar,
        url_github: estudiante.url_github,
        url_linkedin: estudiante.url_linkedin,
        url_portfolio: estudiante.url_portfolio,
        skills,
      },
    };
  }

  return user;
}
