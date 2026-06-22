import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import { PROJECT_SELECT } from "./proyecto.service";

type Client = ReturnType<typeof supabaseForToken>;

/** Devuelve los proyectos guardados del estudiante autenticado. */
export async function listGuardados(token: string, userId: string) {
  const client: Client = supabaseForToken(token);

  const { data, error } = await client
    .from("proyecto_guardado")
    .select(`proyecto:proyecto(${PROJECT_SELECT})`)
    .eq("id_usuario", userId)
    .order("fecha_guardado", { ascending: false });

  if (error) throw new ApiError(500, error.message);

  const proyectos = (data ?? [])
    .map((row) => row.proyecto)
    .filter(Boolean);

  return proyectos;
}

/** Guarda un proyecto para el estudiante. Idempotente (ignora duplicados). */
export async function guardarProyecto(token: string, userId: string, proyectoId: string) {
  const client: Client = supabaseForToken(token);

  const { error } = await client
    .from("proyecto_guardado")
    .upsert({ id_usuario: userId, id_proyecto: proyectoId }, { onConflict: "id_usuario,id_proyecto" });

  if (error) throw new ApiError(500, error.message);
}

/** Elimina un proyecto guardado. */
export async function eliminarGuardado(token: string, userId: string, proyectoId: string) {
  const client: Client = supabaseForToken(token);

  const { error } = await client
    .from("proyecto_guardado")
    .delete()
    .eq("id_usuario", userId)
    .eq("id_proyecto", proyectoId);

  if (error) throw new ApiError(500, error.message);
}

/** Devuelve solo los ids de proyectos guardados (ligero, para el marketplace). */
export async function listGuardadosIds(token: string, userId: string): Promise<string[]> {
  const client: Client = supabaseForToken(token);

  const { data, error } = await client
    .from("proyecto_guardado")
    .select("id_proyecto")
    .eq("id_usuario", userId);

  if (error) throw new ApiError(500, error.message);

  return (data ?? []).map((row) => row.id_proyecto);
}
