import { supabaseForToken } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import type { Database } from "../types/database.types";

type Client = ReturnType<typeof supabaseForToken>;
type EntregableUpdate = Database["public"]["Tables"]["entregable"]["Update"];

/** Resuelve el id de un estado de entregable por nombre. */
async function getEstadoEntregableId(client: Client, nombre: string): Promise<string> {
  const { data, error } = await client
    .from("estado_entregable")
    .select("id")
    .eq("nombre", nombre)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!data)
    throw new ApiError(500, `Falta el estado de entregable '${nombre}' (seeds no aplicados)`);
  return data.id;
}

/** El junior envía un entregable a un proyecto en el que fue adjudicado. */
export async function submitEntregable(
  accessToken: string,
  userId: string,
  input: { id_proyecto: string; url: string; tipo: "parcial" | "final" },
) {
  const client = supabaseForToken(accessToken);

  // Verificar que el usuario tiene una oferta adjudicada en ese proyecto.
  const { data: ofertaAdjudicada, error: ofertaError } = await client
    .from("oferta")
    .select("id, estado:estado_oferta(nombre)")
    .eq("id_proyecto", input.id_proyecto)
    .eq("id_usuario", userId)
    .maybeSingle();
  if (ofertaError) throw new ApiError(500, ofertaError.message);
  if (!ofertaAdjudicada) throw new ApiError(403, "No tenés una postulación en este proyecto");
  if (ofertaAdjudicada.estado?.nombre !== "adjudicada") {
    throw new ApiError(403, "Solo podés enviar entregables si fuiste adjudicado en el proyecto");
  }

  // Calcular group_id: si ya hay entregables del mismo usuario+proyecto, reusar el group_id.
  const { data: entregablesPrevios, error: prevError } = await client
    .from("entregable")
    .select("group_id")
    .eq("id_proyecto", input.id_proyecto)
    .eq("id_usuario", userId)
    .limit(1);
  if (prevError) throw new ApiError(500, prevError.message);

  const groupId =
    entregablesPrevios && entregablesPrevios.length > 0 && entregablesPrevios[0]?.group_id
      ? entregablesPrevios[0].group_id
      : crypto.randomUUID();

  // Calcular version: count de entregables del mismo group_id + 1.
  const { count, error: countError } = await client
    .from("entregable")
    .select("id", { count: "exact", head: true })
    .eq("group_id", groupId);
  if (countError) throw new ApiError(500, countError.message);

  const version = (count ?? 0) + 1;

  const estadoId = await getEstadoEntregableId(client, "enviado");

  const { data: entregable, error: insertError } = await client
    .from("entregable")
    .insert({
      id_proyecto: input.id_proyecto,
      id_usuario: userId,
      id_estado: estadoId,
      group_id: groupId,
      tipo: input.tipo,
      version,
      fecha: new Date().toISOString(),
      url: input.url,
    })
    .select(
      "id, version, tipo, fecha, url, group_id, estado:estado_entregable(nombre), proyecto:proyecto(id, titulo), junior:users(id, nombre, apellido1)",
    )
    .single();
  if (insertError) throw new ApiError(400, insertError.message);

  return entregable;
}

/** Lista los entregables propios del junior autenticado. */
export async function listMyEntregables(accessToken: string, userId: string) {
  const client = supabaseForToken(accessToken);

  const { data, error } = await client
    .from("entregable")
    .select(
      "id, version, tipo, fecha, url, group_id, comentario_revision, estado:estado_entregable(nombre), proyecto:proyecto(id, titulo)",
    )
    .eq("id_usuario", userId)
    .order("fecha", { ascending: false });
  if (error) throw new ApiError(500, error.message);
  return data;
}

/** Lista los entregables de un proyecto. Solo el dueño del proyecto (empresa). */
export async function listProjectEntregables(
  accessToken: string,
  userId: string,
  projectId: string,
) {
  const client = supabaseForToken(accessToken);

  // Verificar que el proyecto pertenece al usuario.
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
    .from("entregable")
    .select(
      "id, version, tipo, fecha, url, group_id, comentario_revision, estado:estado_entregable(nombre), junior:users(id, nombre, apellido1)",
    )
    .eq("id_proyecto", projectId)
    .order("version", { ascending: false });
  if (error) throw new ApiError(500, error.message);
  return data;
}

/** La empresa revisa, aprueba o solicita cambios en un entregable. */
export async function reviewEntregable(
  accessToken: string,
  userId: string,
  entregableId: string,
  accion: "revisar" | "aprobar" | "solicitar_cambios",
  comentario?: string,
) {
  const client = supabaseForToken(accessToken);

  // Verificar que el entregable pertenece a un proyecto del usuario.
  const { data: entregable, error: entError } = await client
    .from("entregable")
    .select("id, id_proyecto")
    .eq("id", entregableId)
    .maybeSingle();
  if (entError) throw new ApiError(500, entError.message);
  if (!entregable) throw new ApiError(404, "Entregable no encontrado");

  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select("empresa:empresario(id_usuario)")
    .eq("id", entregable.id_proyecto)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (proyecto?.empresa?.id_usuario !== userId) {
    throw new ApiError(403, "No podés revisar este entregable");
  }

  // Mapear acción a nombre de estado.
  const estadoNombreMap: Record<typeof accion, string> = {
    revisar: "en_revision",
    aprobar: "aprobado",
    solicitar_cambios: "enviado",
  };
  const estadoNombre = estadoNombreMap[accion];
  const estadoId = await getEstadoEntregableId(client, estadoNombre);

  const updatePayload: EntregableUpdate = { id_estado: estadoId };
  if (accion === "solicitar_cambios" && comentario) {
    updatePayload.comentario_revision = comentario;
  }

  const { data, error } = await client
    .from("entregable")
    .update(updatePayload)
    .eq("id", entregableId)
    .select(
      "id, version, tipo, fecha, url, group_id, comentario_revision, estado:estado_entregable(nombre)",
    )
    .single();
  if (error) throw new ApiError(400, error.message);
  return data;
}
