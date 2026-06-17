import {
  supabase,
  supabaseForToken,
  createEphemeralClient,
  createOAuthClient,
} from "../config/supabase";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { startEmailMfa, verifyEmailMfa } from "./mfa.service";

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
 * Login con email+contraseña. El 2FA por email es OBLIGATORIO: si la contraseña
 * es correcta, NO se devuelve la sesión todavía; se genera un código, se envía
 * por correo y se devuelve `{ mfa_required: true, ticket }`. El FrontEnd pide el
 * código y lo confirma con `verifyLoginOtp` (POST /users/login/verify-otp).
 * (El login social Google/GitHub queda EXENTO del 2FA: ese flujo no pasa por aquí.)
 */
export async function loginUser(input: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    throw new ApiError(error.status ?? 401, error.message);
  }
  if (!data.user || !data.session) {
    throw new ApiError(401, "Credenciales inválidas");
  }

  const ticket = await startEmailMfa({
    userId: data.user.id,
    email: data.user.email ?? input.email,
    refreshToken: data.session.refresh_token,
  });

  return { mfa_required: true as const, ticket };
}

/**
 * Verifica el código de 2FA enviado por email y, si es correcto, entrega la
 * sesión. La llama el FrontEnd tras el login con contraseña.
 */
export async function verifyLoginOtp(ticket: string, code: string) {
  return verifyEmailMfa(ticket, code);
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
 * Idiomas que enruta el FrontEnd (next-intl `i18n/routing.ts`). El enlace del
 * correo debe abrir la página en el idioma del usuario; si el FrontEnd no manda
 * `locale` o manda uno no soportado, se usa el idioma por defecto.
 */
const SUPPORTED_LOCALES = ["es", "en"] as const;
const DEFAULT_LOCALE = "es";

function normalizeLocale(locale?: string): string {
  return locale && (SUPPORTED_LOCALES as readonly string[]).includes(locale)
    ? locale
    : DEFAULT_LOCALE;
}

/**
 * Paso 1 de recuperación: envía el correo con el enlace de recovery. El enlace
 * lleva a la página donde el usuario define la clave nueva, en el idioma que
 * indique el FrontEnd (`locale`). No revela si el correo existe (respuesta
 * uniforme); solo falla si el proveedor de correo cae.
 */
export async function requestPasswordReset(email: string, locale?: string): Promise<void> {
  const lang = normalizeLocale(locale);
  const redirectTo = `${env.frontendUrl}/${lang}/nueva-contrasena`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error && error.status && error.status >= 500) {
    throw new ApiError(502, "No se pudo enviar el correo de recuperación");
  }
}

/**
 * Paso 2 de recuperación: confirma el cambio de contraseña con la sesión de
 * recovery que trae el enlace del correo. Soporta las dos formas en que
 * Supabase puede entregar esa sesión:
 *  - `accessToken` + `refreshToken`: el correo default redirige con la sesión
 *    en el fragment de la URL (#access_token=...). Es el caso actual.
 *  - `tokenHash`: si se personaliza la plantilla (requiere SMTP propio), el
 *    enlace trae un token_hash que se verifica con verifyOtp.
 * Cliente efímero para no contaminar el cliente compartido.
 */
export async function confirmPasswordReset(input: {
  tokenHash?: string;
  accessToken?: string;
  refreshToken?: string;
  password: string;
}): Promise<void> {
  const client = createEphemeralClient();

  if (input.tokenHash) {
    const { error } = await client.auth.verifyOtp({ token_hash: input.tokenHash, type: "recovery" });
    if (error) throw new ApiError(400, "El enlace de recuperación es inválido o expiró");
  } else if (input.accessToken && input.refreshToken) {
    const { error } = await client.auth.setSession({
      access_token: input.accessToken,
      refresh_token: input.refreshToken,
    });
    if (error) throw new ApiError(400, "El enlace de recuperación es inválido o expiró");
  } else {
    throw new ApiError(400, "Falta el token de recuperación");
  }

  const { error } = await client.auth.updateUser({ password: input.password });
  if (error) throw new ApiError(400, error.message);
}

/** Proveedores de OAuth soportados. */
const OAUTH_PROVIDERS = ["google", "github"] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

/** Type guard: confirma que un string es un provider de OAuth soportado. */
export function isOAuthProvider(value: string): value is OAuthProvider {
  return (OAUTH_PROVIDERS as readonly string[]).includes(value);
}

/**
 * Devuelve la URL de autorización del provider (Google/GitHub) para iniciar el
 * login social. El navegador del usuario debe ir a esa URL; tras autenticar, el
 * provider -> Supabase -> redirige a `${frontendUrl}/${locale}/auth/callback`
 * con la sesión en el fragment (#access_token=...). El FrontEnd no habla con
 * Supabase: solo abre esta URL y luego procesa el callback contra el BackEnd.
 */
export async function getOAuthUrl(provider: OAuthProvider, locale: string): Promise<string> {
  const redirectTo = `${env.frontendUrl}/${locale}/auth/callback`;
  const client = createOAuthClient();

  const { data, error } = await client.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error || !data?.url) {
    throw new ApiError(error?.status ?? 502, error?.message ?? "No se pudo iniciar el login social");
  }
  return data.url;
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

/** Columnas de `empresario` que muestra la página de perfil de empresa/emprendedor. */
const EMPRESARIO_DETAIL_SELECT =
  "id, tipo, nombre_comercial, descripcion, sector, tipos_proyecto, apoyo_tecnico_necesario, cedula_juridica, direccion, url_sitio_web, etapa, presupuesto";

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

  if (user.role?.nombre === "company") {
    const { data: empresario, error: empresarioError } = await client
      .from("empresario")
      .select(EMPRESARIO_DETAIL_SELECT)
      .eq("id_usuario", userId)
      .maybeSingle();
    if (empresarioError) throw new ApiError(500, empresarioError.message);
    if (!empresario) return { ...user, empresario: null };

    const { data: logoFile } = await client
      .from("files")
      .select("storage_path")
      .eq("id_empresario", empresario.id)
      .eq("tipo", "logo")
      .maybeSingle();

    return { ...user, empresario: { ...empresario, url_logo: logoFile?.storage_path ?? null } };
  }

  return user;
}
