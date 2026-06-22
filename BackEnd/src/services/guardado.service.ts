import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import { PROJECT_SELECT } from "./proyecto.service";

type Client = ReturnType<typeof supabaseForToken>;

/** Devuelve los proyectos guardados del estudiante autenticado. */
export async function listGuardados(token: string, userId: string) {
  const client: Client = supabaseForToken(token);

  // Paso 1: obtener los ids guardados
  const { data: rows, error: rowsErr } = await client
    .from("proyecto_guardado")
    .select("id_proyecto")
    .eq("id_usuario", userId)
    .order("fecha_guardado", { ascending: false });

  if (rowsErr) throw new ApiError(500, rowsErr.message);
  if (!rows || rows.length === 0) return [];

  const ids = rows.map((r) => r.id_proyecto);

  // Paso 2: obtener los proyectos en esos ids
  const { data: proyectos, error: projErr } = await client
    .from("proyecto")
    .select(PROJECT_SELECT)
    .in("id", ids);

  if (projErr) throw new ApiError(500, projErr.message);

  // Mantener el orden original (guardado más reciente primero)
  const map = new Map((proyectos ?? []).map((p) => [p.id, p]));
  return ids.map((id) => map.get(id)).filter(Boolean);
}

/** Guarda un proyecto para el estudiante. Idempotente (ignora duplicados). */
export async function guardarProyecto(token: string, userId: string, proyectoId: string) {
  const client: Client = supabaseForToken(token);

  const { error } = await client
    .from("proyecto_guardado")
    .upsert(
      { id_usuario: userId, id_proyecto: proyectoId },
      { onConflict: "id_usuario,id_proyecto" },
    );

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
