import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";

/** Filtros opcionales del listado de proyectos. */
export type ProjectFilters = {
  area?: string | undefined; // id_area_negocio
  skill?: string | undefined; // id_skill
  plazoMax?: number | undefined; // plazo_dias <= plazoMax
  q?: string | undefined; // búsqueda en el título
};

/**
 * Campos y relaciones que se devuelven de un proyecto. La visibilidad real
 * (solo publicados, o los propios del empresario) la garantiza el RLS;
 * aquí solo definimos la forma de la respuesta.
 */
const PROJECT_SELECT = `
  id,
  titulo,
  descripcion,
  usa_ia,
  plazo_dias,
  fecha_publicacion,
  fecha_cierre,
  estado:estado_proyecto(id, nombre),
  area:area_negocio(id, nombre),
  empresa:empresario(id, nombre_comercial, tipo),
  skills:project_skills(skill:skills(id, nombre, tipo, categoria))
`;

/**
 * Lista proyectos visibles para el usuario (RLS: publicados o propios).
 * Aplica los filtros opcionales recibidos. El filtro por skill se resuelve
 * en dos pasos para no recortar la lista de skills de cada proyecto.
 */
export async function listProjects(accessToken: string, filters: ProjectFilters) {
  const client = supabaseForToken(accessToken);

  // Filtro por skill: primero obtenemos los proyectos que la incluyen.
  let projectIdsConSkill: string[] | null = null;
  if (filters.skill) {
    const { data: rows, error } = await client
      .from("project_skills")
      .select("id_proyecto")
      .eq("id_skill", filters.skill);

    if (error) {
      throw new ApiError(500, error.message);
    }
    projectIdsConSkill = rows.map((row) => row.id_proyecto);
    if (projectIdsConSkill.length === 0) {
      return []; // ningún proyecto usa esa skill
    }
  }

  let query = client
    .from("proyecto")
    .select(PROJECT_SELECT)
    .order("fecha_publicacion", { ascending: false, nullsFirst: false });

  if (filters.area) {
    query = query.eq("id_area_negocio", filters.area);
  }
  if (filters.plazoMax !== undefined) {
    query = query.lte("plazo_dias", filters.plazoMax);
  }
  if (filters.q) {
    query = query.ilike("titulo", `%${filters.q}%`);
  }
  if (projectIdsConSkill) {
    query = query.in("id", projectIdsConSkill);
  }

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, error.message);
  }
  return data;
}

/** Devuelve un proyecto por id, o 404 si no existe / no es visible para el usuario. */
export async function getProjectById(accessToken: string, id: string) {
  const client = supabaseForToken(accessToken);

  const { data, error } = await client
    .from("proyecto")
    .select(PROJECT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, error.message);
  }
  if (!data) {
    throw new ApiError(404, "Proyecto no encontrado");
  }
  return data;
}
