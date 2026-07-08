import { supabaseForToken, supabaseAdmin } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import { crearNotificacion, crearNotificaciones, MENSAJES_NOTIFICACION, TIPO_POR_MENSAJE } from "./notificacion.service";
import { triggerNuevaCalificacion } from "./notificacionTriggers.service";
import type { CreateOfertaInput, DecideOfertaInput, ReviewOfertaInput, CalificarOfertaInput, ReplicarCalificacionInput, EditOfertaInput } from "../validations/oferta";

type Client = ReturnType<typeof supabaseForToken>;

/** Resuelve el id de un estado de oferta por nombre. */
async function getEstadoOfertaId(client: Client, nombre: string): Promise<string> {
  const { data, error } = await client
    .from("estado_oferta")
    .select("id")
    .eq("nombre", nombre)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(500, `Falta el estado de oferta '${nombre}' (seeds no aplicados)`);
  return data.id;
}

/** Resuelve el id de un estado de proyecto por nombre. */
async function getEstadoProyectoId(client: Client, nombre: string): Promise<string> {
  const { data, error } = await client
    .from("estado_proyecto")
    .select("id")
    .eq("nombre", nombre)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(500, `Falta el estado de proyecto '${nombre}' (seeds no aplicados)`);
  return data.id;
}

/** Estados de oferta que siguen "abiertos" (pendientes de decisión). */
const ESTADOS_OFERTA_PENDIENTES = ["enviada", "en_revision", "solicitar_cambios"];

/**
 * Cierra la recepción de un proyecto al adjudicarlo: pasa el proyecto a 'adjudicado'
 * (lo saca del marketplace y bloquea nuevas propuestas) y marca el resto de
 * propuestas pendientes como 'no_seleccionada', notificando a esos juniors.
 * El llamador ya verificó que el usuario es dueño del proyecto.
 */
async function cerrarProyectoAdjudicado(
  client: Client,
  accessToken: string,
  idProyecto: string,
  ofertaGanadoraId: string,
  tituloProyecto: string,
): Promise<void> {
  // 1. Proyecto -> adjudicado.
  const estadoProyectoId = await getEstadoProyectoId(client, "adjudicado");
  const { error: projError } = await client
    .from("proyecto")
    .update({ id_estado: estadoProyectoId })
    .eq("id", idProyecto);
  if (projError) throw new ApiError(400, projError.message);

  // 2. Rechazar las demás propuestas pendientes del proyecto.
  const { data: otras, error: otrasError } = await client
    .from("oferta")
    .select("id, id_usuario, estado:estado_oferta(nombre)")
    .eq("id_proyecto", idProyecto)
    .neq("id", ofertaGanadoraId);
  if (otrasError) throw new ApiError(500, otrasError.message);

  const pendientes = (otras ?? []).filter((o) =>
    ESTADOS_OFERTA_PENDIENTES.includes(o.estado?.nombre ?? ""),
  );
  if (pendientes.length === 0) return;

  const noSeleccionadaId = await getEstadoOfertaId(client, "no_seleccionada");
  const { error: updError } = await client
    .from("oferta")
    .update({ id_estado: noSeleccionadaId, updated_at: new Date().toISOString() })
    .in("id", pendientes.map((o) => o.id));
  if (updError) throw new ApiError(400, updError.message);

  // Notificar a los juniors no seleccionados (best-effort).
  await crearNotificaciones(
    accessToken,
    pendientes.map((o) => o.id_usuario),
    MENSAJES_NOTIFICACION.postulacionRechazada(tituloProyecto),
    TIPO_POR_MENSAJE.postulacionRechazada,
  );
}

/**
 * La empresa reabre un proyecto adjudicado: DESHACE la adjudicación (p. ej. el junior adjudicado
 * abandonó, o fue un error). El proyecto vuelve a 'en_recepcion' (vuelve al marketplace y acepta
 * postulaciones) y TODAS las ofertas que estaban 'adjudicada' o 'no_seleccionada' vuelven a
 * 'enviada', para que la empresa vuelva a evaluar el pool completo. Al dejar de estar 'adjudicada',
 * el junior queda libre para postular a otros proyectos. Solo el dueño; solo desde adjudicado/en
 * desarrollo.
 */
export async function reabrirAdjudicacion(accessToken: string, userId: string, projectId: string) {
  const client = supabaseForToken(accessToken);

  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select("id, titulo, estado:estado_proyecto(nombre), empresa:empresario(id_usuario)")
    .eq("id", projectId)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (!proyecto) throw new ApiError(404, "Proyecto no encontrado");
  if (proyecto.empresa?.id_usuario !== userId) throw new ApiError(403, "Este proyecto no es tuyo");

  const estadoActual = proyecto.estado?.nombre;
  if (estadoActual !== "adjudicado" && estadoActual !== "en_desarrollo") {
    throw new ApiError(409, "Solo se puede reabrir un proyecto adjudicado o en desarrollo");
  }

  const { data: ofertas, error: ofertasError } = await client
    .from("oferta")
    .select("id, id_usuario, estado:estado_oferta(nombre)")
    .eq("id_proyecto", projectId);
  if (ofertasError) throw new ApiError(500, ofertasError.message);

  // Todas las que estaban adjudicada o rechazada vuelven a 'enviada' (pool reabierto).
  const afectadas = (ofertas ?? []).filter((o) =>
    o.estado?.nombre === "adjudicada" || o.estado?.nombre === "no_seleccionada",
  );
  if (afectadas.length > 0) {
    const enviadaId = await getEstadoOfertaId(client, "enviada");
    const { error: updOfertasError } = await client
      .from("oferta")
      .update({ id_estado: enviadaId, updated_at: new Date().toISOString() })
      .in("id", afectadas.map((o) => o.id));
    if (updOfertasError) throw new ApiError(400, updOfertasError.message);
  }

  // Proyecto -> en_recepcion.
  const recepcionId = await getEstadoProyectoId(client, "en_recepcion");
  const { data: updated, error: updError } = await client
    .from("proyecto")
    .update({ id_estado: recepcionId })
    .eq("id", projectId)
    .select("id, estado:estado_proyecto(nombre)")
    .single();
  if (updError) throw new ApiError(400, updError.message);

  // Notificar a los juniors afectados (best-effort).
  if (afectadas.length > 0) {
    await crearNotificaciones(
      accessToken,
      afectadas.map((o) => o.id_usuario),
      MENSAJES_NOTIFICACION.proyectoReabierto(proyecto.titulo ?? ""),
      TIPO_POR_MENSAJE.proyectoReabierto,
    );
  }

  return updated;
}

/** Estados de proyecto en los que una adjudicación ya NO ocupa al estudiante. */
const ESTADOS_PROYECTO_INACTIVOS = ["cerrado", "cancelado"];

/**
 * Devuelve el conjunto de ids de estudiantes OCUPADOS dentro de `userIds`: los que
 * tienen una oferta 'adjudicada' en un proyecto que no está cerrado ni cancelado.
 * Un estudiante ocupado no puede postular ni ser adjudicado por otra empresa; se
 * libera cuando su proyecto pasa a 'cerrado'/'cancelado'.
 */
export async function estudiantesOcupados(client: Client, userIds: string[]): Promise<Set<string>> {
  const ocupados = new Set<string>();
  if (userIds.length === 0) return ocupados;

  const { data, error } = await client
    .from("oferta")
    .select("id_usuario, estado:estado_oferta(nombre), proyecto:proyecto(estado:estado_proyecto(nombre))")
    .in("id_usuario", userIds);
  if (error) throw new ApiError(500, error.message);

  for (const o of data ?? []) {
    if (
      o.estado?.nombre === "adjudicada" &&
      !ESTADOS_PROYECTO_INACTIVOS.includes(o.proyecto?.estado?.nombre ?? "")
    ) {
      ocupados.add(o.id_usuario);
    }
  }
  return ocupados;
}

/** ¿El estudiante tiene un proyecto adjudicado todavía activo? */
export async function tieneProyectoActivo(
  client: ReturnType<typeof supabaseForToken>,
  userId: string,
): Promise<boolean> {
  return (await estudiantesOcupados(client, [userId])).has(userId);
}

/**
 * El junior postula a un proyecto. Reglas: cuenta aprobada, rol student, el
 * proyecto debe estar en recepción, y no haber postulado antes (UNIQUE).
 * La carta (propuesta) SIEMPRE la escribe el junior — la IA nunca la genera.
 */
export async function createOferta(
  accessToken: string,
  userId: string,
  projectId: string,
  input: CreateOfertaInput,
) {
  const client = supabaseForToken(accessToken);

  const { data: cuenta, error: cuentaError } = await client
    .from("users")
    .select("estado_cuenta, role:roles(nombre)")
    .eq("id", userId)
    .maybeSingle();
  if (cuentaError) throw new ApiError(500, cuentaError.message);
  if (!cuenta) throw new ApiError(403, "Completá tu onboarding antes de postular");
  if (cuenta.estado_cuenta !== "activa") {
    throw new ApiError(403, "Tu cuenta debe estar aprobada para postular");
  }
  if (cuenta.role?.nombre !== "student") {
    throw new ApiError(403, "Solo los juniors pueden postular");
  }

  // Un estudiante con un proyecto adjudicado activo no puede postular a otro
  // (la idea es repartir el trabajo y no sobrecargar a una sola persona).
  if (await tieneProyectoActivo(client, userId)) {
    throw new ApiError(
      409,
      "Ya tenés un proyecto activo. No podés postular a otro hasta que ese proyecto se cierre.",
    );
  }

  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select("id, titulo, estado:estado_proyecto(nombre), empresa:empresario(id_usuario)")
    .eq("id", projectId)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (!proyecto) throw new ApiError(404, "Proyecto no encontrado");
  if (proyecto.estado?.nombre !== "en_recepcion") {
    throw new ApiError(409, "Este proyecto no está recibiendo postulaciones");
  }

  // Check for existing offers from this user for this project.
  // A new version is only allowed when the latest offer is in 'solicitar_cambios'.
  const { data: existingOfertas, error: existError } = await client
    .from("oferta")
    .select("id, estado:estado_oferta(nombre), fecha_envio")
    .eq("id_proyecto", projectId)
    .eq("id_usuario", userId)
    .order("fecha_envio", { ascending: false });
  if (existError) throw new ApiError(500, existError.message);
  if (existingOfertas && existingOfertas.length > 0) {
    const latest = existingOfertas[0]!;
    const latestState = (latest.estado as { nombre: string } | null)?.nombre;
    if (latestState !== "solicitar_cambios") {
      throw new ApiError(409, "Ya postulaste a este proyecto. Solo podés enviar una nueva versión cuando la empresa solicite cambios.");
    }
  }

  const estadoId = await getEstadoOfertaId(client, "enviada");
  const { data: oferta, error } = await client
    .from("oferta")
    .insert({
      id_proyecto: projectId,
      id_usuario: userId,
      id_estado: estadoId,
      propuesta: input.propuesta,
      prototipo_url: input.prototipo_url || null,
      url_repositorio: input.url_repositorio || null,
      documentacion_tecnica: input.documentacion_tecnica ?? null,
      documentacion_url: input.documentacion_url ?? null,
    })
    .select("id, fecha_envio")
    .single();
  if (error) throw new ApiError(400, error.message);

  // Notificar a la empresa que recibio una nueva postulacion (best-effort).
  const empresaUserId = (proyecto.empresa as { id_usuario: string } | null)?.id_usuario;
  if (empresaUserId) {
    await crearNotificacion(
      accessToken,
      empresaUserId,
      MENSAJES_NOTIFICACION.nuevaPostulacion(proyecto.titulo),
      TIPO_POR_MENSAJE.nuevaPostulacion,
    );
  }

  return oferta;
}

/** Lista las calificaciones recibidas por el junior autenticado. */
export async function listMyCalificaciones(accessToken: string, userId: string) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("oferta")
    .select(
      "id, calificacion, comentario_calificacion, replica_calificacion, updated_at, proyecto:proyecto(id, titulo, empresa:empresario(nombre_comercial))",
    )
    .eq("id_usuario", userId)
    .not("calificacion", "is", null)
    .order("updated_at", { ascending: false });
  if (error) throw new ApiError(500, error.message);
  return data;
}

/** Lista las postulaciones del junior autenticado. */
export async function listMyOfertas(accessToken: string, userId: string) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("oferta")
    .select(
      "id, propuesta, prototipo_url, url_repositorio, documentacion_tecnica, documentacion_url, fecha_envio, comentario_revision, calificacion, comentario_calificacion, estado:estado_oferta(nombre), proyecto:proyecto(id, titulo, fecha_cierre)",
    )
    .eq("id_usuario", userId)
    .order("fecha_envio", { ascending: false });
  if (error) throw new ApiError(500, error.message);
  return data;
}

/**
 * Devuelve una postulación con los datos de CONTACTO del junior (correo y los
 * links de su perfil de estudiante) para que la empresa pueda contactarlo tras
 * adjudicar. Solo el dueño del proyecto al que pertenece la oferta puede verla;
 * el RLS de la migración 0011 (`users_empresa_ve_postulantes`,
 * `estudiante_empresa_ve_postulantes`) habilita el embed del postulante.
 */
export async function getOfertaContacto(accessToken: string, userId: string, ofertaId: string) {
  const client = supabaseForToken(accessToken);

  // 1. La oferta debe existir y pertenecer a un proyecto del usuario.
  const { data: oferta, error: ofertaError } = await client
    .from("oferta")
    .select("id, id_proyecto")
    .eq("id", ofertaId)
    .maybeSingle();
  if (ofertaError) throw new ApiError(500, ofertaError.message);
  if (!oferta) throw new ApiError(404, "Postulación no encontrada");

  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select("empresa:empresario(id_usuario)")
    .eq("id", oferta.id_proyecto)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (proyecto?.empresa?.id_usuario !== userId) {
    throw new ApiError(403, "No podés ver esta postulación");
  }

  // 2. La oferta con el contacto del junior (users + perfil estudiante).
  const { data, error } = await client
    .from("oferta")
    .select(
      "id, propuesta, prototipo_url, fecha_envio, estado:estado_oferta(nombre), proyecto:proyecto(id, titulo), junior:users(id, nombre, apellido1, apellido2, correo, estudiante:estudiante(url_github, url_linkedin, url_portfolio))",
    )
    .eq("id", ofertaId)
    .single();
  if (error) throw new ApiError(500, error.message);
  return data;
}

/** Lista las postulaciones recibidas en un proyecto. Solo el dueño del proyecto. */
export async function listProjectOfertas(accessToken: string, userId: string, projectId: string) {
  const client = supabaseForToken(accessToken);

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

  const { data, error } = await client
    .from("oferta")
    .select(
      "id, propuesta, prototipo_url, url_repositorio, documentacion_tecnica, documentacion_url, fecha_envio, comentario_revision, calificacion, comentario_calificacion, estado:estado_oferta(nombre), junior:users(id, nombre, apellido1)",
    )
    .eq("id_proyecto", projectId)
    .order("fecha_envio", { ascending: false });
  if (error) throw new ApiError(500, error.message);

  // Marcamos qué postulantes están "ocupados" (con un proyecto activo) para que la
  // empresa los vea como no disponibles, sin ocultar su propuesta ni su perfil.
  const juniorIds = [
    ...new Set((data ?? []).map((o) => o.junior?.id).filter((id): id is string => Boolean(id))),
  ];
  const ocupados = await estudiantesOcupados(client, juniorIds);

  return (data ?? []).map((o) => ({
    ...o,
    disponible: o.junior ? !ocupados.has(o.junior.id) : true,
  }));
}

/**
 * La empresa acepta (adjudicada) o rechaza (no_seleccionada) una postulación.
 * Verifica que la oferta pertenezca a un proyecto del usuario.
 */
export async function decideOferta(
  accessToken: string,
  userId: string,
  ofertaId: string,
  input: DecideOfertaInput,
) {
  const client = supabaseForToken(accessToken);

  const { data: oferta, error: ofertaError } = await client
    .from("oferta")
    .select("id, id_proyecto, id_usuario")
    .eq("id", ofertaId)
    .maybeSingle();
  if (ofertaError) throw new ApiError(500, ofertaError.message);
  if (!oferta) throw new ApiError(404, "Postulación no encontrada");

  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select("titulo, empresa:empresario(id_usuario)")
    .eq("id", oferta.id_proyecto)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (!proyecto || proyecto.empresa?.id_usuario !== userId) {
    throw new ApiError(403, "No podés decidir sobre esta postulación");
  }

  // No se puede adjudicar a un estudiante que ya tiene un proyecto activo. La
  // empresa igual ve su propuesta/perfil (lo marca como 'ocupado' en la UI).
  if (input.accion === "aceptar" && (await tieneProyectoActivo(client, oferta.id_usuario))) {
    throw new ApiError(
      409,
      "Este estudiante ya tiene un proyecto activo y no está disponible por el momento.",
    );
  }

  const estadoNombre = input.accion === "aceptar" ? "adjudicada" : "no_seleccionada";
  const estadoId = await getEstadoOfertaId(client, estadoNombre);
  const { data, error } = await client
    .from("oferta")
    .update({ id_estado: estadoId, updated_at: new Date().toISOString() })
    .eq("id", ofertaId)
    .select("id, estado:estado_oferta(nombre)")
    .single();
  if (error) throw new ApiError(400, error.message);

  // Notificar al junior segun la decision de la empresa (best-effort).
  if (input.accion === "rechazar") {
    await crearNotificacion(
      accessToken,
      oferta.id_usuario,
      MENSAJES_NOTIFICACION.postulacionRechazada(proyecto.titulo),
      TIPO_POR_MENSAJE.postulacionRechazada,
    );
  } else if (input.accion === "aceptar") {
    await crearNotificacion(
      accessToken,
      oferta.id_usuario,
      MENSAJES_NOTIFICACION.postulacionAdjudicada(proyecto.titulo),
      TIPO_POR_MENSAJE.postulacionAdjudicada,
    );
    // La empresa también recibe un aviso para dar seguimiento al junior adjudicado.
    await crearNotificacion(
      accessToken,
      userId,
      MENSAJES_NOTIFICACION.seguimientoAdjudicacion(proyecto.titulo),
      TIPO_POR_MENSAJE.seguimientoAdjudicacion,
      oferta.id_proyecto,
    );
    // Cierra la recepción: proyecto -> adjudicado y rechaza las demás propuestas.
    await cerrarProyectoAdjudicado(client, accessToken, oferta.id_proyecto, ofertaId, proyecto.titulo);
  }

  return data;
}

/**
 * La empresa revisa una postulación: puede ponerla en revisión, solicitar
 * cambios, adjudicarla o rechazarla, y dejar un comentario opcional.
 * Reemplaza el flujo antiguo que solo aceptaba "aceptar"/"rechazar".
 */
export async function reviewOferta(
  accessToken: string,
  userId: string,
  ofertaId: string,
  input: ReviewOfertaInput,
) {
  const client = supabaseForToken(accessToken);

  const { data: oferta, error: ofertaError } = await client
    .from("oferta")
    .select("id, id_proyecto, id_usuario")
    .eq("id", ofertaId)
    .maybeSingle();
  if (ofertaError) throw new ApiError(500, ofertaError.message);
  if (!oferta) throw new ApiError(404, "Postulación no encontrada");

  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select("titulo, empresa:empresario(id_usuario)")
    .eq("id", oferta.id_proyecto)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (proyecto?.empresa?.id_usuario !== userId) {
    throw new ApiError(403, "No podés revisar esta postulación");
  }

  if (input.accion === "aceptar" && (await tieneProyectoActivo(client, oferta.id_usuario))) {
    throw new ApiError(
      409,
      "Este estudiante ya tiene un proyecto activo y no está disponible por el momento.",
    );
  }

  const estadoMap: Record<ReviewOfertaInput["accion"], string> = {
    en_revision:       "en_revision",
    solicitar_cambios: "solicitar_cambios",
    aceptar:           "adjudicada",
    rechazar:          "no_seleccionada",
  };
  const estadoId = await getEstadoOfertaId(client, estadoMap[input.accion]);

  const { data, error } = await client
    .from("oferta")
    .update({
      id_estado: estadoId,
      ...(input.comentario !== undefined ? { comentario_revision: input.comentario } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", ofertaId)
    .select("id, comentario_revision, estado:estado_oferta(nombre)")
    .single();
  if (error) throw new ApiError(400, error.message);

  const titulo = proyecto.titulo;
  if (input.accion === "aceptar") {
    await crearNotificacion(
      accessToken, oferta.id_usuario,
      MENSAJES_NOTIFICACION.postulacionAdjudicada(titulo),
      TIPO_POR_MENSAJE.postulacionAdjudicada,
    );
    // La empresa también recibe un aviso para dar seguimiento al junior adjudicado.
    await crearNotificacion(
      accessToken, userId,
      MENSAJES_NOTIFICACION.seguimientoAdjudicacion(titulo),
      TIPO_POR_MENSAJE.seguimientoAdjudicacion,
      oferta.id_proyecto,
    );
    // Cierra la recepción: proyecto -> adjudicado y rechaza las demás propuestas.
    await cerrarProyectoAdjudicado(client, accessToken, oferta.id_proyecto, ofertaId, titulo);
  } else if (input.accion === "solicitar_cambios") {
    await crearNotificacion(
      accessToken, oferta.id_usuario,
      MENSAJES_NOTIFICACION.cambiosSolicitados(titulo),
      TIPO_POR_MENSAJE.cambiosSolicitados,
    );
  } else if (input.accion === "rechazar") {
    await crearNotificacion(
      accessToken, oferta.id_usuario,
      MENSAJES_NOTIFICACION.postulacionRechazada(titulo),
      TIPO_POR_MENSAJE.postulacionRechazada,
    );
  }

  return data;
}

/**
 * El junior edita su propia propuesta. Solo si está en "enviada" (aún no
 * revisada por la empresa). Permite actualizar carta, enlace y documentación.
 */
export async function editOferta(
  accessToken: string,
  userId: string,
  ofertaId: string,
  input: EditOfertaInput,
) {
  const client = supabaseForToken(accessToken);

  const { data: oferta, error: ofertaError } = await client
    .from("oferta")
    .select("id, id_usuario, estado:estado_oferta(nombre)")
    .eq("id", ofertaId)
    .maybeSingle();
  if (ofertaError) throw new ApiError(500, ofertaError.message);
  if (!oferta) throw new ApiError(404, "Postulación no encontrada");
  if (oferta.id_usuario !== userId) throw new ApiError(403, "No podés editar esta postulación");

  const estadoActual = oferta.estado?.nombre;
  if (estadoActual !== "enviada") {
    throw new ApiError(409, "Solo podés editar una propuesta que aún no fue revisada");
  }

  const { data, error } = await client
    .from("oferta")
    .update({
      ...(input.propuesta !== undefined      ? { propuesta: input.propuesta }                         : {}),
      ...(input.prototipo_url !== undefined  ? { prototipo_url: input.prototipo_url ?? null }         : {}),
      ...(input.url_repositorio !== undefined ? { url_repositorio: input.url_repositorio ?? null }    : {}),
      ...(input.documentacion_tecnica !== undefined ? { documentacion_tecnica: input.documentacion_tecnica ?? null } : {}),
      ...(input.documentacion_url !== undefined ? { documentacion_url: input.documentacion_url ?? null } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", ofertaId)
    .eq("id_usuario", userId)
    .select("id, propuesta, prototipo_url, url_repositorio, documentacion_tecnica, documentacion_url")
    .single();
  if (error) throw new ApiError(400, error.message);
  return data;
}

/**
 * El junior retira su propia postulación. Solo se puede retirar si está en
 * "enviada" o "en_revision"; no se puede retirar una oferta adjudicada.
 */
export async function withdrawOferta(
  accessToken: string,
  userId: string,
  ofertaId: string,
): Promise<void> {
  const client = supabaseForToken(accessToken);

  const { data: oferta, error: ofertaError } = await client
    .from("oferta")
    .select("id, id_usuario, estado:estado_oferta(nombre)")
    .eq("id", ofertaId)
    .maybeSingle();
  if (ofertaError) throw new ApiError(500, ofertaError.message);
  if (!oferta) throw new ApiError(404, "Postulación no encontrada");
  if (oferta.id_usuario !== userId) {
    throw new ApiError(403, "No podés retirar esta postulación");
  }

  const estadoActual = oferta.estado?.nombre;
  if (estadoActual !== "enviada" && estadoActual !== "en_revision") {
    throw new ApiError(409, "Solo podés retirar postulaciones en estado 'enviada' o 'en_revision'");
  }

  const { error } = await client
    .from("oferta")
    .delete()
    .eq("id", ofertaId)
    .eq("id_usuario", userId);
  if (error) throw new ApiError(400, error.message);
}

/**
 * La empresa califica la oferta adjudicada del junior tras cerrar el proyecto.
 * Solo se puede calificar si el proyecto está en estado "cerrado".
 */
export async function calificarOferta(
  accessToken: string,
  userId: string,
  ofertaId: string,
  input: CalificarOfertaInput,
) {
  const client = supabaseForToken(accessToken);

  const { data: oferta, error: ofertaError } = await client
    .from("oferta")
    .select("id, id_proyecto, id_usuario")
    .eq("id", ofertaId)
    .maybeSingle();
  if (ofertaError) throw new ApiError(500, ofertaError.message);
  if (!oferta) throw new ApiError(404, "Postulación no encontrada");

  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select("titulo, empresa:empresario(id_usuario), estado:estado_proyecto(nombre)")
    .eq("id", oferta.id_proyecto)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (proyecto?.empresa?.id_usuario !== userId) {
    throw new ApiError(403, "No podés calificar esta postulación");
  }

  const { data, error } = await client
    .from("oferta")
    .update({
      calificacion: input.calificacion,
      comentario_calificacion: input.comentario ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ofertaId)
    .select("id, calificacion, comentario_calificacion, replica_calificacion, estado:estado_oferta(nombre)")
    .single();
  if (error) throw new ApiError(400, error.message);

  // Cerrar el proyecto automáticamente al calificar (fin del ciclo de vida).
  // Usa el cliente admin (service_role) para bypassar RLS: es una operación de
  // sistema, no una acción directa del usuario.
  const admin = supabaseAdmin();
  const { data: estadoCerrado, error: estadoCerradoError } = await admin
    .from("estado_proyecto")
    .select("id")
    .eq("nombre", "cerrado")
    .maybeSingle();
  if (estadoCerradoError) throw new ApiError(500, estadoCerradoError.message);
  if (!estadoCerrado) throw new ApiError(500, "Falta el estado 'cerrado' (seeds no aplicados)");

  const { error: closeError } = await admin
    .from("proyecto")
    .update({ id_estado: estadoCerrado.id })
    .eq("id", oferta.id_proyecto);
  if (closeError) throw new ApiError(500, `No se pudo cerrar el proyecto: ${closeError.message}`);

  // Notificar al junior que recibió una calificación (best-effort).
  if (oferta.id_usuario && proyecto?.titulo) {
    void triggerNuevaCalificacion(
      oferta.id_usuario,
      input.calificacion,
      proyecto.titulo,
      ofertaId,
    );
  }

  return data;
}

/**
 * El junior responde a la calificación que recibió. Solo se puede replicar una
 * vez y únicamente si ya existe una calificación.
 */
export async function replicarCalificacion(
  accessToken: string,
  userId: string,
  ofertaId: string,
  input: ReplicarCalificacionInput,
) {
  const client = supabaseForToken(accessToken);

  const { data: oferta, error: ofertaError } = await client
    .from("oferta")
    .select("id, id_usuario, calificacion, replica_calificacion")
    .eq("id", ofertaId)
    .maybeSingle();
  if (ofertaError) throw new ApiError(500, ofertaError.message);
  if (!oferta) throw new ApiError(404, "Postulación no encontrada");
  if (oferta.id_usuario !== userId) {
    throw new ApiError(403, "No podés replicar esta calificación");
  }
  if (oferta.calificacion === null || oferta.calificacion === undefined) {
    throw new ApiError(409, "Esta postulación aún no tiene una calificación");
  }
  if (oferta.replica_calificacion !== null && oferta.replica_calificacion !== undefined) {
    throw new ApiError(409, "Ya replicaste esta calificación");
  }

  const { data, error } = await client
    .from("oferta")
    .update({
      replica_calificacion: input.replica,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ofertaId)
    .select("id, calificacion, comentario_calificacion, replica_calificacion, estado:estado_oferta(nombre)")
    .single();
  if (error) throw new ApiError(400, error.message);
  return data;
}
