import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import type { Database } from "../types/database.types";
import type {
  CreateProjectInput,
  ChangeProjectStateInput,
  UpdateProjectInput,
} from "../validations/project";

type ProyectoUpdate = Database["public"]["Tables"]["proyecto"]["Update"];

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
  tecnologias_extra,
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

/**
 * Lista los proyectos PROPIOS de la empresa autenticada (incluye borradores,
 * porque es el dueño). Para la pantalla "Mis Proyectos". Se distingue de
 * `listProjects`, que mezcla los publicados de todos con los propios.
 */
export async function listMyProjects(accessToken: string, userId: string) {
  const client = supabaseForToken(accessToken);

  // 1. Resolver el empresario del usuario.
  const { data: empresario, error: empError } = await client
    .from("empresario")
    .select("id")
    .eq("id_usuario", userId)
    .maybeSingle();
  if (empError) throw new ApiError(500, empError.message);
  if (!empresario) throw new ApiError(403, "Solo las empresas tienen proyectos");

  // 2. Solo los proyectos de ese empresario.
  const { data, error } = await client
    .from("proyecto")
    .select(PROJECT_SELECT)
    .eq("id_empresario", empresario.id)
    .order("fecha_publicacion", { ascending: false, nullsFirst: false });
  if (error) throw new ApiError(500, error.message);
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

/**
 * Crea un proyecto en nombre de una empresa APROBADA. Si `publicar` es true,
 * queda visible (en_recepcion) con fechas calculadas; si no, queda en borrador.
 * El RLS garantiza además que la empresa pertenezca al usuario.
 */
export async function createProject(
  accessToken: string,
  userId: string,
  input: CreateProjectInput,
) {
  const client = supabaseForToken(accessToken);

  // 1. La cuenta debe estar aprobada.
  const { data: cuenta, error: cuentaError } = await client
    .from("users")
    .select("estado_cuenta")
    .eq("id", userId)
    .maybeSingle();
  if (cuentaError) throw new ApiError(500, cuentaError.message);
  if (cuenta?.estado_cuenta !== "activa") {
    throw new ApiError(403, "Tu cuenta debe estar aprobada para publicar proyectos");
  }

  // 2. El usuario debe tener perfil de empresa/emprendedor.
  const { data: empresario, error: empError } = await client
    .from("empresario")
    .select("id")
    .eq("id_usuario", userId)
    .maybeSingle();
  if (empError) throw new ApiError(500, empError.message);
  if (!empresario) {
    throw new ApiError(403, "Solo las empresas pueden publicar proyectos");
  }

  // 3. Resolver el estado destino (borrador o en_recepcion).
  const estadoNombre = input.publicar ? "en_recepcion" : "borrador";
  const { data: estado, error: estadoError } = await client
    .from("estado_proyecto")
    .select("id")
    .eq("nombre", estadoNombre)
    .maybeSingle();
  if (estadoError) throw new ApiError(500, estadoError.message);
  if (!estado) throw new ApiError(500, `Falta el estado '${estadoNombre}' (seeds no aplicados)`);

  // 4. Fechas: solo al publicar. fecha_cierre = publicacion + plazo_dias.
  let fechaPublicacion: string | null = null;
  let fechaCierre: string | null = null;
  if (input.publicar) {
    const ahora = new Date();
    fechaPublicacion = ahora.toISOString();
    const cierre = new Date(ahora);
    cierre.setDate(cierre.getDate() + input.plazo_dias);
    fechaCierre = cierre.toISOString();
  }

  // 5. Crear el proyecto.
  const { data: proyecto, error: insertError } = await client
    .from("proyecto")
    .insert({
      id_empresario: empresario.id,
      id_area_negocio: input.id_area_negocio,
      id_estado: estado.id,
      titulo: input.titulo,
      descripcion: input.descripcion,
      usa_ia: input.usa_ia ?? false,
      plazo_dias: input.plazo_dias,
      tecnologias_extra: input.tecnologias_extra ?? [],
      fecha_publicacion: fechaPublicacion,
      fecha_cierre: fechaCierre,
    })
    .select("id, titulo, estado:estado_proyecto(nombre)")
    .single();
  if (insertError) throw new ApiError(400, insertError.message);

  // 6. Vincular skills requeridas (si llegaron).
  if (input.skills && input.skills.length > 0) {
    const rows = [...new Set(input.skills)].map((id_skill) => ({
      id_proyecto: proyecto.id,
      id_skill,
    }));
    const { error: skillsError } = await client.from("project_skills").insert(rows);
    if (skillsError) throw new ApiError(400, skillsError.message);
  }

  return proyecto;
}

/**
 * La empresa dueña cambia el estado de su proyecto para gestionar su ciclo de
 * vida (cerrar recepción, adjudicar, marcar en desarrollo o cerrar). Los
 * estados válidos los acota `ChangeProjectStateSchema` (sin 'cancelado', que es
 * moderación del admin). El RLS de UPDATE de proyecto exige además ser el dueño;
 * aquí se valida explícitamente para devolver 403/404 claros.
 */
export async function changeProjectState(
  accessToken: string,
  userId: string,
  projectId: string,
  input: ChangeProjectStateInput,
) {
  const client = supabaseForToken(accessToken);

  // 1. El proyecto debe existir y pertenecer al usuario.
  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select("id, empresa:empresario(id_usuario)")
    .eq("id", projectId)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (!proyecto) throw new ApiError(404, "Proyecto no encontrado");
  if (proyecto.empresa?.id_usuario !== userId) {
    throw new ApiError(403, "Este proyecto no es tuyo");
  }

  // 2. Resolver el id del estado destino.
  const { data: estado, error: estadoError } = await client
    .from("estado_proyecto")
    .select("id")
    .eq("nombre", input.estado)
    .maybeSingle();
  if (estadoError) throw new ApiError(500, estadoError.message);
  if (!estado) throw new ApiError(500, `Falta el estado '${input.estado}' (seeds no aplicados)`);

  // 3. Actualizar el estado del proyecto.
  const { data, error } = await client
    .from("proyecto")
    .update({ id_estado: estado.id })
    .eq("id", projectId)
    .select("id, estado:estado_proyecto(nombre)")
    .single();
  if (error) throw new ApiError(400, error.message);
  return data;
}

/**
 * La empresa edita los datos de su proyecto. Solo se permite si el proyecto
 * está en estado "borrador" o "en_recepcion"; los proyectos adjudicados o en
 * desarrollo no se pueden modificar.
 */
export async function updateProject(
  accessToken: string,
  userId: string,
  projectId: string,
  input: UpdateProjectInput,
) {
  const client = supabaseForToken(accessToken);

  // 1. El proyecto debe existir y pertenecer al usuario.
  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select("id, empresa:empresario(id_usuario), estado:estado_proyecto(nombre)")
    .eq("id", projectId)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (!proyecto) throw new ApiError(404, "Proyecto no encontrado");
  if (proyecto.empresa?.id_usuario !== userId) {
    throw new ApiError(403, "Este proyecto no es tuyo");
  }

  const estadoActual = proyecto.estado?.nombre;
  if (estadoActual !== "borrador" && estadoActual !== "en_recepcion") {
    throw new ApiError(409, "Solo podés editar proyectos en borrador o en recepción");
  }

  // 2. Construir el payload de actualización con los campos enviados.
  const updatePayload: ProyectoUpdate = {};
  if (input.titulo !== undefined) updatePayload.titulo = input.titulo;
  if (input.descripcion !== undefined) updatePayload.descripcion = input.descripcion;
  if (input.id_area_negocio !== undefined) updatePayload.id_area_negocio = input.id_area_negocio;
  if (input.plazo_dias !== undefined) updatePayload.plazo_dias = input.plazo_dias;
  if (input.usa_ia !== undefined) updatePayload.usa_ia = input.usa_ia;

  if (Object.keys(updatePayload).length > 0) {
    const { error: updateError } = await client
      .from("proyecto")
      .update(updatePayload)
      .eq("id", projectId);
    if (updateError) throw new ApiError(400, updateError.message);
  }

  // 3. Si vienen skills, reemplazarlas por completo.
  if (input.skills !== undefined) {
    const { error: deleteError } = await client
      .from("project_skills")
      .delete()
      .eq("id_proyecto", projectId);
    if (deleteError) throw new ApiError(400, deleteError.message);

    if (input.skills.length > 0) {
      const rows = [...new Set(input.skills)].map((id_skill) => ({
        id_proyecto: projectId,
        id_skill,
      }));
      const { error: insertError } = await client.from("project_skills").insert(rows);
      if (insertError) throw new ApiError(400, insertError.message);
    }
  }

  // 4. Devolver el proyecto actualizado con la misma forma que el resto de endpoints.
  const { data, error } = await client
    .from("proyecto")
    .select(PROJECT_SELECT)
    .eq("id", projectId)
    .single();
  if (error) throw new ApiError(500, error.message);
  return data;
}

/**
 * Elimina un proyecto. Solo el dueño puede hacerlo y el proyecto debe estar
 * en borrador (sin postulantes ni actividad real).
 */
export async function deleteProject(
  accessToken: string,
  userId: string,
  projectId: string,
) {
  const client = supabaseForToken(accessToken);

  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select("id, empresa:empresario(id_usuario), estado:estado_proyecto(nombre)")
    .eq("id", projectId)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (!proyecto) throw new ApiError(404, "Proyecto no encontrado");
  if (proyecto.empresa?.id_usuario !== userId) {
    throw new ApiError(403, "Este proyecto no es tuyo");
  }
  const estadoActual = proyecto.estado?.nombre;
  if (estadoActual !== "borrador") {
    if (estadoActual !== "en_recepcion") {
      throw new ApiError(409, "Solo podés eliminar proyectos en borrador o sin propuestas recibidas");
    }
    // En recepción: solo permitir si no hay propuestas
    const { count, error: countError } = await client
      .from("oferta")
      .select("id", { count: "exact", head: true })
      .eq("id_proyecto", projectId);
    if (countError) throw new ApiError(500, countError.message);
    if ((count ?? 0) > 0) {
      throw new ApiError(409, "No podés eliminar un proyecto que ya recibió propuestas");
    }
  }

  const { error, count } = await client
    .from("proyecto")
    .delete({ count: "exact" })
    .eq("id", projectId);
  if (error) throw new ApiError(400, error.message);
  if (!count || count === 0) {
    throw new ApiError(403, "No se pudo eliminar el proyecto (permiso denegado)");
  }
}
