import { supabase } from "../config/supabase";

/**
 * Verifica que el BackEnd pueda hablar con la base (Supabase). Hace una consulta
 * mínima a un catálogo: si responde sin error, la conexión está viva. El RLS
 * puede devolver 0 filas para el cliente anon (eso NO es un error); solo un fallo
 * real de conexión deja `error` con valor. Devuelve `true` si la DB es accesible.
 */
export async function isDatabaseReachable(): Promise<boolean> {
  const { error } = await supabase.from("roles").select("id").limit(1);
  return !error;
}