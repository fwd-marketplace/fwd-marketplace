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
