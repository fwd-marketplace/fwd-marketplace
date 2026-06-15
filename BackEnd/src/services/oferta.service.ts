import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import type { CreateOfertaInput, DecideOfertaInput } from "../validations/oferta";

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

  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select("id, estado:estado_proyecto(nombre)")
    .eq("id", projectId)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (!proyecto) throw new ApiError(404, "Proyecto no encontrado");
  if (proyecto.estado?.nombre !== "en_recepcion") {
    throw new ApiError(409, "Este proyecto no está recibiendo postulaciones");
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
    })
    .select("id, fecha_envio")
    .single();
  if (error) {
    if (error.code === "23505") throw new ApiError(409, "Ya postulaste a este proyecto");
    throw new ApiError(400, error.message);
  }
  return oferta;
}

/** Lista las postulaciones del junior autenticado. */
export async function listMyOfertas(accessToken: string, userId: string) {
  const client = supabaseForToken(accessToken);
  const { data, error } = await client
    .from("oferta")
    .select(
      "id, propuesta, prototipo_url, fecha_envio, estado:estado_oferta(nombre), proyecto:proyecto(id, titulo)",
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
      "id, propuesta, prototipo_url, fecha_envio, estado:estado_oferta(nombre), junior:users(id, nombre, apellido1)",
    )
    .eq("id_proyecto", projectId)
    .order("fecha_envio", { ascending: false });
  if (error) throw new ApiError(500, error.message);
  return data;
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
    throw new ApiError(403, "No podés decidir sobre esta postulación");
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
  return data;
}
