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
