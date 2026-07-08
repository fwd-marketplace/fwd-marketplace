import { createClient } from "@supabase/supabase-js";
import { env } from "./env";
import type { Database } from "../types/database.types";

/**
 * Cliente único de Supabase para todo el BackEnd.
 *
 * Usa la clave anon/publishable. La autenticación (registro, login, validación
 * de sesión/JWT) la gestiona Supabase Auth a través de este cliente; el
 * FrontEnd nunca habla con Supabase directamente, solo con este BackEnd.
 *
 * persistSession/autoRefreshToken en false: el servidor no guarda sesión propia,
 * cada token de usuario se valida puntualmente con supabase.auth.getUser(token).
 */
export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Cliente Supabase con la identidad de un usuario concreto.
 *
 * Reenvía el `access_token` del usuario en cada petición, de modo que
 * `auth.uid()` resuelve dentro de Postgres y las políticas RLS aplican
 * por usuario. Usar en los services para cualquier consulta protegida.
 */
export function supabaseForToken(accessToken: string) {
  return createClient<Database>(env.supabaseUrl, env.supabaseKey, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Cliente Supabase efímero (anon, sin sesión) para operaciones de sesión como
 * refresh y logout. Se usa una instancia nueva por llamada para no contaminar
 * el cliente compartido `supabase` con estado de sesión en memoria entre
 * peticiones concurrentes.
 */
export function createEphemeralClient() {
  return createClient<Database>(env.supabaseUrl, env.supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Cliente con clave service_role: bypassa RLS para operaciones de sistema.
 * Solo usar para acciones que el servidor ejecuta por su cuenta (no en nombre
 * de un usuario), como cerrar automáticamente un proyecto al calificar.
 */
export function supabaseAdmin() {
  return createClient<Database>(env.supabaseUrl, env.supabaseServiceKey || env.supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Cliente para iniciar OAuth (Google/GitHub) con flujo "implicit": Supabase
 * redirige con la sesión en el fragment de la URL (#access_token=...), igual que
 * la recuperación de contraseña. Se evita PKCE a propósito: su `code_verifier`
 * no se puede preservar entre requests con clientes efímeros y stateless.
 */
export function createOAuthClient() {
  return createClient<Database>(env.supabaseUrl, env.supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      flowType: "implicit",
    },
  });
}
