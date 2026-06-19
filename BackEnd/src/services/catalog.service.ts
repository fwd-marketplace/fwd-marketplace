import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";

/**
 * Devuelve los catálogos que el FrontEnd necesita para selects y filtros:
 * áreas de negocio, skills y estados de proyecto. Lectura para autenticados
 * (RLS: `catalogo_lectura`). Se hace en paralelo para una sola ida y vuelta.
 */
export async function getCatalogs(accessToken: string) {
  const client = supabaseForToken(accessToken);

  const [areas, skills, projectStates, conocimientos] = await Promise.all([
    client.from("area_negocio").select("id, nombre, descripcion").eq("activo", true).order("nombre"),
    client.from("skills").select("id, nombre, tipo, categoria").order("nombre"),
    client.from("estado_proyecto").select("id, nombre, orden").order("orden"),
    client.from("conocimiento").select("id, nombre, categoria").order("nombre"),
  ]);

  if (areas.error) throw new ApiError(500, areas.error.message);
  if (skills.error) throw new ApiError(500, skills.error.message);
  if (projectStates.error) throw new ApiError(500, projectStates.error.message);
  if (conocimientos.error) throw new ApiError(500, conocimientos.error.message);

  return {
    areas: areas.data,
    skills: skills.data,
    projectStates: projectStates.data,
    conocimientos: conocimientos.data,
  };
}
