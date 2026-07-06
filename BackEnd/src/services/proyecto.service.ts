import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { crearNotificaciones, MENSAJES_NOTIFICACION, TIPO_POR_MENSAJE } from "./notificacion.service";
import { triggerNuevoProyectoCompatible } from "./notificacionTriggers.service";
import { oppositeLocale, translateFields } from "./ai/translation.service";
import type { Database, Json } from "../types/database.types";
import type { AppLocale } from "../validations/ai";
import type {
  CreateProjectInput,
  ChangeProjectStateInput,
  UpdateProjectInput,
} from "../validations/project";

type Client = ReturnType<typeof supabaseForToken>;
type ProyectoUpdate = Database["public"]["Tables"]["proyecto"]["Update"];

/**
 * Traduce el contenido del proyecto (titulo/descripcion/condiciones) al idioma opuesto al original
 * y persiste `idioma_original` + `traduccion`. Best-effort: si la traducción no está disponible se
 * guarda `traduccion = null` (el FrontEnd no muestra el botón). No bloquea la creación/edición.
 */
async function persistProjectTranslation(
  client: Client,
  projectId: string,
  fields: { titulo: string; descripcion: string; condiciones: string },
  from: AppLocale,
): Promise<void> {
  const traduccion = await translateFields({ fields, from, to: oppositeLocale(from) });
  const { error } = await client
    .from("proyecto")
    .update({ idioma_original: from, traduccion: (traduccion as Json) ?? null })
    .eq("id", projectId);
  if (error) {
    logger.warn("proyecto_traduccion_persist_failed", { reason: error.message });
  }
}

/** Resuelve el id de un estado de proyecto por nombre. */
async function getEstadoProyectoId(client: Client, nombre: string): Promise<string> {
  const { data, error } = await client
    .from("estado_proyecto")
    .select("id")
    .eq("nombre", nombre)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(500, `Falta el estado '${nombre}' (seeds no aplicados)`);
  return data.id;
}

/**
 * Ids de usuario de las ofertas de un proyecto en los estados dados. Best-effort:
 * devuelve [] y loguea ante error (se usa para notificar, nunca debe romper la accion).
 */
async function getOfertaRecipients(
  client: Client,
  projectId: string,
  estados: string[],
): Promise<string[]> {
  const { data, error } = await client
    .from("oferta")
    .select("id_usuario, estado:estado_oferta(nombre)")
    .eq("id_proyecto", projectId);
  if (error) {
    logger.warn("No se pudieron leer destinatarios de notificacion", { error: error.message });
    return [];
  }
  const ids = (data ?? [])
    .filter((oferta) => estados.includes(oferta.estado?.nombre ?? ""))
    .map((oferta) => oferta.id_usuario);
  return [...new Set(ids)];
}

/** Estados en los que la empresa puede editar datos del proyecto (incluye pausado para agregar compensación). */
const ESTADOS_EDITABLES = new Set(["borrador", "en_recepcion", "pausado"]);

/** Ofertas que bloquean reducir compensación o reciben aviso si sube. */
const OFERTAS_ACTIVAS = ["enviada", "en_revision", "solicitar_cambios"] as const;

export type CompensacionUpdateDecision =
  | { allowed: true; notifyIncrease: boolean }
  | { allowed: false; statusCode: number; message: string };

/** Reglas de negocio para cambiar compensacion (función pura, testeable). */
export function resolveCompensacionUpdate(
  estadoActual: string,
  compensacionActual: number | null,
  compensacionNueva: number,
  tienePostulacionesActivas: boolean,
): CompensacionUpdateDecision {
  if (!ESTADOS_EDITABLES.has(estadoActual)) {
    return {
      allowed: false,
      statusCode: 409,
      message: "No podés editar la compensación en este estado",
    };
  }
  if (
    compensacionActual != null &&
    compensacionNueva < compensacionActual &&
    tienePostulacionesActivas
  ) {
    return {
      allowed: false,
      statusCode: 400,
      message: "No podés reducir la compensación mientras haya postulaciones activas",
    };
  }
  const notifyIncrease =
    estadoActual === "en_recepcion" &&
    compensacionActual != null &&
    compensacionNueva > compensacionActual &&
    tienePostulacionesActivas;
  return { allowed: true, notifyIncrease };
}

function formatCompensacionUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })} USD`;
}

/** Cuenta ofertas activas (enviada, en_revision, solicitar_cambios) de un proyecto. */
async function countActiveOffers(client: Client, projectId: string): Promise<number> {
  const { data, error } = await client
    .from("oferta")
    .select("id, estado:estado_oferta(nombre)")
    .eq("id_proyecto", projectId);
  if (error) {
    logger.warn("No se pudieron contar postulaciones activas", { error: error.message });
    return 0;
  }
  return (data ?? []).filter((o) =>
    (OFERTAS_ACTIVAS as readonly string[]).includes(o.estado?.nombre ?? ""),
  ).length;
}

/** Filtros opcionales del listado de proyectos. */
export type ProjectFilters = {
  area?: string | undefined; // id_area_negocio
  skill?: string | undefined; // id_skill
  plazoMax?: number | undefined; // plazo_dias <= plazoMax
  compensacionMin?: number | undefined;
  compensacionMax?: number | undefined;
  q?: string | undefined; // búsqueda en el título
};

/**
 * Campos y relaciones que se devuelven de un proyecto. La visibilidad real
 * (solo publicados, o los propios del empresario) la garantiza el RLS;
 * aquí solo definimos la forma de la respuesta.
 */
export const PROJECT_SELECT = `
  id,
  titulo,
  descripcion,
  condiciones,
  compensacion,
  moneda,
  compensacion_actualizada_en,
  usa_ia,
  plazo_dias,
  tecnologias_extra,
  idioma_original,
  traduccion,
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

  // Resolver el id del estado "en_recepcion" para filtrar en DB (no en JS).
  const { data: estadoRec, error: estadoError } = await client
    .from("estado_proyecto")
    .select("id")
    .eq("nombre", "en_recepcion")
    .maybeSingle();
  if (estadoError) throw new ApiError(500, estadoError.message);
  if (!estadoRec) return []; // seeds no aplicados — no hay proyectos posibles

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

  const now = new Date().toISOString();

  let query = client
    .from("proyecto")
    .select(PROJECT_SELECT)
    // Solo proyectos activamente en recepción (estado exacto en DB)
    .eq("id_estado", estadoRec.id)
    // Solo proyectos con compensación declarada (transparencia para juniors)
    .not("compensacion", "is", null)
    // Excluir proyectos cuyo plazo ya venció (fecha_cierre en el pasado)
    .or(`fecha_cierre.is.null,fecha_cierre.gt.${now}`)
    .order("fecha_publicacion", { ascending: false, nullsFirst: false });

  if (filters.area) {
    query = query.eq("id_area_negocio", filters.area);
  }
  if (filters.plazoMax !== undefined) {
    query = query.lte("plazo_dias", filters.plazoMax);
  }
  if (filters.compensacionMin !== undefined) {
    query = query.gte("compensacion", filters.compensacionMin);
  }
  if (filters.compensacionMax !== undefined) {
    query = query.lte("compensacion", filters.compensacionMax);
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
  return data ?? [];
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

  // 3. Contar ofertas por proyecto en una sola consulta: total y "por revisar".
  //    "Por revisar" = postulaciones pendientes de la DECISIÓN de la empresa (enviada o en
  //    revisión); excluye 'solicitar_cambios' (espera al junior) y las ya resueltas
  //    (adjudicada / no_seleccionada). Es la cola accionable del empresario.
  const projectIds = (data ?? []).map((p) => p.id);
  const countMap = new Map<string, number>();
  const porRevisarMap = new Map<string, number>();
  if (projectIds.length > 0) {
    const { data: ofertaRows } = await client
      .from("oferta")
      .select("id_proyecto, estado:estado_oferta(nombre)")
      .in("id_proyecto", projectIds);
    for (const row of ofertaRows ?? []) {
      countMap.set(row.id_proyecto, (countMap.get(row.id_proyecto) ?? 0) + 1);
      const estado = row.estado?.nombre;
      if (estado === "enviada" || estado === "en_revision") {
        porRevisarMap.set(row.id_proyecto, (porRevisarMap.get(row.id_proyecto) ?? 0) + 1);
      }
    }
  }

  return (data ?? []).map((p) => ({
    ...p,
    n_ofertas: countMap.get(p.id) ?? 0,
    n_por_revisar: porRevisarMap.get(p.id) ?? 0,
  }));
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

  if (input.publicar && input.compensacion == null) {
    throw new ApiError(400, "La compensación es obligatoria para publicar");
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
  const ahoraIso = new Date().toISOString();
  const { data: proyecto, error: insertError } = await client
    .from("proyecto")
    .insert({
      id_empresario: empresario.id,
      id_area_negocio: input.id_area_negocio,
      id_estado: estado.id,
      titulo: input.titulo,
      descripcion: input.descripcion,
      condiciones: input.condiciones ?? "",
      usa_ia: input.usa_ia ?? false,
      plazo_dias: input.plazo_dias,
      tecnologias_extra: input.tecnologias_extra ?? [],
      fecha_publicacion: fechaPublicacion,
      fecha_cierre: fechaCierre,
      ...(input.compensacion != null
        ? {
            compensacion: input.compensacion,
            moneda: "USD",
            compensacion_actualizada_en: ahoraIso,
          }
        : {}),
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

  // 7. Traducir el contenido al idioma opuesto y guardarlo (best-effort, no bloquea la creación).
  await persistProjectTranslation(
    client,
    proyecto.id,
    { titulo: input.titulo, descripcion: input.descripcion, condiciones: input.condiciones ?? "" },
    input.locale,
  );

  // 8. Si el proyecto se publicó directamente (en_recepcion), notificar a los
  //    juniors compatibles (best-effort, no bloquea la respuesta al cliente).
  if (input.publicar) {
    void triggerNuevoProyectoCompatible(proyecto.id, proyecto.titulo ?? input.titulo);
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
    .select("id, titulo, compensacion, empresa:empresario(id_usuario)")
    .eq("id", projectId)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (!proyecto) throw new ApiError(404, "Proyecto no encontrado");
  if (proyecto.empresa?.id_usuario !== userId) {
    throw new ApiError(403, "Este proyecto no es tuyo");
  }

  if (input.estado === "en_recepcion" && proyecto.compensacion == null) {
    throw new ApiError(400, "Agregá la compensación antes de abrir el proyecto a postulaciones");
  }

  // 2. Resolver el id del estado destino y actualizar.
  const estadoId = await getEstadoProyectoId(client, input.estado);
  const { data, error } = await client
    .from("proyecto")
    .update({ id_estado: estadoId })
    .eq("id", projectId)
    .select("id, estado:estado_proyecto(nombre)")
    .single();
  if (error) throw new ApiError(400, error.message);

  // 3. Al cerrar el proyecto, se agradece a los junior(s) adjudicado(s) (best-effort).
  if (input.estado === "cerrado") {
    const adjudicados = await getOfertaRecipients(client, projectId, ["adjudicada"]);
    await crearNotificaciones(
      accessToken,
      adjudicados,
      MENSAJES_NOTIFICACION.proyectoCerrado(proyecto.titulo),
      TIPO_POR_MENSAJE.proyectoCerrado,
    );
  }

  // 4. Al pasar a en_recepcion (publicar desde borrador), notificar juniors compatibles.
  if (input.estado === "en_recepcion") {
    void triggerNuevoProyectoCompatible(projectId, proyecto.titulo ?? projectId);
  }

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
    .select(
      "id, titulo, descripcion, condiciones, compensacion, empresa:empresario(id_usuario), estado:estado_proyecto(nombre)",
    )
    .eq("id", projectId)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (!proyecto) throw new ApiError(404, "Proyecto no encontrado");
  if (proyecto.empresa?.id_usuario !== userId) {
    throw new ApiError(403, "Este proyecto no es tuyo");
  }

  const estadoActual = proyecto.estado?.nombre;
  if (!estadoActual || !ESTADOS_EDITABLES.has(estadoActual)) {
    throw new ApiError(409, "Solo podés editar proyectos en borrador, recepción o pausados");
  }

  let notifyCompensacionIncrease = false;

  if (input.compensacion !== undefined) {
    const activas = await countActiveOffers(client, projectId);
    const decision = resolveCompensacionUpdate(
      estadoActual,
      proyecto.compensacion,
      input.compensacion,
      activas > 0,
    );
    if (!decision.allowed) {
      throw new ApiError(decision.statusCode, decision.message);
    }
    notifyCompensacionIncrease = decision.notifyIncrease;
  }

  // 2. Construir el payload de actualización con los campos enviados.
  const updatePayload: ProyectoUpdate = {};
  if (input.titulo !== undefined) updatePayload.titulo = input.titulo;
  if (input.descripcion !== undefined) updatePayload.descripcion = input.descripcion;
  if (input.condiciones !== undefined) updatePayload.condiciones = input.condiciones;
  if (input.id_area_negocio !== undefined) updatePayload.id_area_negocio = input.id_area_negocio;
  if (input.plazo_dias !== undefined) updatePayload.plazo_dias = input.plazo_dias;
  if (input.usa_ia !== undefined) updatePayload.usa_ia = input.usa_ia;
  if (input.tecnologias_extra !== undefined) updatePayload.tecnologias_extra = input.tecnologias_extra;
  if (input.compensacion !== undefined) {
    updatePayload.compensacion = input.compensacion;
    updatePayload.moneda = "USD";
    updatePayload.compensacion_actualizada_en = new Date().toISOString();
  }

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

  // 3.b Si cambió algún campo de texto, re-traducir el contenido al idioma opuesto (best-effort).
  const cambioTexto =
    input.titulo !== undefined ||
    input.descripcion !== undefined ||
    input.condiciones !== undefined;
  if (cambioTexto) {
    await persistProjectTranslation(
      client,
      projectId,
      {
        titulo: input.titulo ?? proyecto.titulo,
        descripcion: input.descripcion ?? proyecto.descripcion,
        condiciones: input.condiciones ?? proyecto.condiciones,
      },
      input.locale,
    );
  }

  if (notifyCompensacionIncrease && input.compensacion != null) {
    const destinatarios = await getOfertaRecipients(client, projectId, [...OFERTAS_ACTIVAS]);
    await crearNotificaciones(
      accessToken,
      destinatarios,
      MENSAJES_NOTIFICACION.compensacionAumentada(proyecto.titulo, formatCompensacionUsd(input.compensacion)),
      TIPO_POR_MENSAJE.compensacionAumentada,
      projectId,
    );
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
 * La empresa cancela/oculta su proyecto (soft): lo pasa a 'cancelado'. Se conserva
 * el historial y se libera a los estudiantes adjudicados (los estados inactivos los
 * desocupan). Notifica a adjudicados y postulantes pendientes (best-effort).
 */
/**
 * La empresa reactiva un proyecto pausado, volviéndolo al estado en_recepcion
 * para que vuelva a aparecer en el marketplace.
 */
export async function resumeMyProject(accessToken: string, userId: string, projectId: string) {
  const client = supabaseForToken(accessToken);

  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select(
      "id, titulo, plazo_dias, compensacion, estado:estado_proyecto(nombre), empresa:empresario(id_usuario)",
    )
    .eq("id", projectId)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (!proyecto) throw new ApiError(404, "Proyecto no encontrado");
  if (proyecto.empresa?.id_usuario !== userId) {
    throw new ApiError(403, "Este proyecto no es tuyo");
  }
  if (proyecto.estado?.nombre !== "pausado") {
    throw new ApiError(409, "Solo se puede reactivar un proyecto pausado");
  }
  if (proyecto.compensacion == null) {
    throw new ApiError(400, "Agregá la compensación antes de reactivar el proyecto");
  }

  const estadoId = await getEstadoProyectoId(client, "en_recepcion");
  const ahora = new Date();
  const cierre = new Date(ahora);
  cierre.setDate(cierre.getDate() + proyecto.plazo_dias);

  const { data, error } = await client
    .from("proyecto")
    .update({
      id_estado: estadoId,
      fecha_publicacion: ahora.toISOString(),
      fecha_cierre: cierre.toISOString(),
    })
    .eq("id", projectId)
    .select("id, estado:estado_proyecto(nombre)")
    .single();
  if (error) throw new ApiError(400, error.message);

  return data;
}

/**
 * La empresa cancela su proyecto: notifica a los participantes y lo elimina
 * definitivamente de la base de datos via la RPC `eliminar_proyecto`.
 */
export async function cancelMyProject(
  accessToken: string,
  userId: string,
  projectId: string,
): Promise<{ ok: true }> {
  const client = supabaseForToken(accessToken);

  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select("id, titulo, estado:estado_proyecto(nombre), empresa:empresario(id_usuario)")
    .eq("id", projectId)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (!proyecto) throw new ApiError(404, "Proyecto no encontrado");
  if (proyecto.empresa?.id_usuario !== userId) {
    throw new ApiError(403, "Este proyecto no es tuyo");
  }
  if (proyecto.estado?.nombre === "cerrado") {
    throw new ApiError(409, "No se puede cancelar un proyecto cerrado");
  }

  // Notificar ANTES de borrar (después las ofertas ya no existen). Best-effort.
  const destinatarios = await getOfertaRecipients(client, projectId, [
    "adjudicada",
    "enviada",
    "en_revision",
  ]);
  await crearNotificaciones(
    accessToken,
    destinatarios,
    MENSAJES_NOTIFICACION.proyectoEliminado(proyecto.titulo),
    TIPO_POR_MENSAJE.proyectoEliminado,
  );

  const { error } = await client.rpc("eliminar_proyecto", { p_id: projectId });
  if (error) throw new ApiError(400, error.message);

  return { ok: true };
}

/**
 * La empresa pausa temporalmente su proyecto. El proyecto deja de aparecer en
 * el marketplace y su fecha_cierre se limpia (plazo congelado). No se envían
 * notificaciones porque es una acción reversible.
 */
export async function pauseMyProject(accessToken: string, userId: string, projectId: string) {
  const client = supabaseForToken(accessToken);

  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select("id, titulo, estado:estado_proyecto(nombre), empresa:empresario(id_usuario)")
    .eq("id", projectId)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (!proyecto) throw new ApiError(404, "Proyecto no encontrado");
  if (proyecto.empresa?.id_usuario !== userId) {
    throw new ApiError(403, "Este proyecto no es tuyo");
  }
  const estadoActual = proyecto.estado?.nombre;
  if (estadoActual === "cerrado" || estadoActual === "cancelado") {
    throw new ApiError(409, "No se puede pausar un proyecto cerrado o cancelado");
  }
  if (estadoActual === "pausado") {
    throw new ApiError(409, "El proyecto ya está pausado");
  }

  const estadoId = await getEstadoProyectoId(client, "pausado");
  const { data, error } = await client
    .from("proyecto")
    .update({ id_estado: estadoId, fecha_cierre: null })
    .eq("id", projectId)
    .select("id, estado:estado_proyecto(nombre)")
    .single();
  if (error) throw new ApiError(400, error.message);

  return data;
}

/**
 * La empresa elimina DEFINITIVAMENTE su proyecto (hard delete). Protege los
 * proyectos 'cerrado' (registro historico del junior). Notifica a adjudicados y
 * postulantes ANTES de borrar (luego las ofertas ya no existen) y borra todo via la
 * RPC `eliminar_proyecto` (SECURITY DEFINER, migracion 0032).
 */
export async function deleteMyProject(
  accessToken: string,
  userId: string,
  projectId: string,
): Promise<{ ok: true }> {
  const client = supabaseForToken(accessToken);

  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select("id, titulo, estado:estado_proyecto(nombre), empresa:empresario(id_usuario)")
    .eq("id", projectId)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (!proyecto) throw new ApiError(404, "Proyecto no encontrado");
  if (proyecto.empresa?.id_usuario !== userId) {
    throw new ApiError(403, "Este proyecto no es tuyo");
  }
  if (proyecto.estado?.nombre === "cerrado") {
    throw new ApiError(409, "No se puede eliminar un proyecto cerrado");
  }

  // Notificar ANTES de borrar (despues las ofertas ya no existen). Best-effort.
  const destinatarios = await getOfertaRecipients(client, projectId, [
    "adjudicada",
    "enviada",
    "en_revision",
  ]);
  await crearNotificaciones(
    accessToken,
    destinatarios,
    MENSAJES_NOTIFICACION.proyectoEliminado(proyecto.titulo),
      TIPO_POR_MENSAJE.proyectoEliminado,
  );

  const { error } = await client.rpc("eliminar_proyecto", { p_id: projectId });
  if (error) throw new ApiError(400, error.message);

  return { ok: true };
}
