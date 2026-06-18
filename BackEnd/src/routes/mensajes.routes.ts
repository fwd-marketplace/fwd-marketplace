import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { supabaseForToken } from "../config/supabase";

const router = Router();

const idParamSchema = z.string().uuid();
const enviarMensajeSchema = z.object({
  contenido: z.string().min(1).max(5000),
});

/**
 * Verifica que el usuario tiene acceso al proyecto como participante:
 * - Es el junior adjudicado, o
 * - Es el dueño del proyecto (empresa).
 *
 * Devuelve el id del junior adjudicado y el id del empresario dueño para poder
 * determinar el destinatario al enviar mensajes.
 */
async function resolveProyectoAcceso(
  client: ReturnType<typeof supabaseForToken>,
  userId: string,
  projectId: string,
): Promise<{ juniorId: string; empresaUserId: string }> {
  // Obtener el proyecto con el dueño (empresario) y la oferta adjudicada.
  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select("id, empresa:empresario(id_usuario)")
    .eq("id", projectId)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (!proyecto) throw new ApiError(404, "Proyecto no encontrado");

  const empresaUserId = proyecto.empresa?.id_usuario;
  if (!empresaUserId) throw new ApiError(500, "El proyecto no tiene empresa asociada");

  // Buscar la oferta adjudicada para encontrar al junior.
  const { data: ofertaAdj, error: ofertaError } = await client
    .from("oferta")
    .select("id_usuario, estado:estado_oferta(nombre)")
    .eq("id_proyecto", projectId)
    .maybeSingle();
  if (ofertaError) throw new ApiError(500, ofertaError.message);

  // Filtrar por estado adjudicada en memoria (no se puede filtrar por join en supabase-js fácilmente).
  const adjudicada =
    ofertaAdj && ofertaAdj.estado?.nombre === "adjudicada" ? ofertaAdj : null;

  const juniorId = adjudicada?.id_usuario ?? null;

  // Verificar acceso: debe ser el dueño del proyecto o el junior adjudicado.
  if (userId !== empresaUserId && userId !== juniorId) {
    throw new ApiError(403, "No tenés acceso a los mensajes de este proyecto");
  }

  if (!juniorId) {
    throw new ApiError(409, "Este proyecto aún no tiene un junior adjudicado");
  }

  return { juniorId, empresaUserId };
}

/** GET /api/mensajes/proyecto/:id — Mensajes de un proyecto. */
async function listMensajes(req: Request, res: Response) {
  if (!req.accessToken || !req.user) throw new ApiError(401, "No autenticado");

  const idParsed = idParamSchema.safeParse(req.params.id);
  if (!idParsed.success) throw new ApiError(400, "El id del proyecto no es válido");

  const client = supabaseForToken(req.accessToken);
  const userId = req.user.id;

  await resolveProyectoAcceso(client, userId, idParsed.data);

  const { data, error } = await client
    .from("mensaje")
    .select(
      "id, contenido, es_publico, fecha_envio, remitente:users!mensaje_id_remitente_fkey(id, nombre, apellido1), id_destinatario",
    )
    .eq("id_proyecto", idParsed.data)
    .order("fecha_envio", { ascending: true });
  if (error) throw new ApiError(500, error.message);

  res.status(200).json({ mensajes: data });
}

/** POST /api/mensajes/proyecto/:id — Enviar mensaje en un proyecto. */
async function enviarMensaje(req: Request, res: Response) {
  if (!req.accessToken || !req.user) throw new ApiError(401, "No autenticado");

  const idParsed = idParamSchema.safeParse(req.params.id);
  if (!idParsed.success) throw new ApiError(400, "El id del proyecto no es válido");

  const bodyParsed = enviarMensajeSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    throw new ApiError(400, bodyParsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const client = supabaseForToken(req.accessToken);
  const userId = req.user.id;

  const { juniorId, empresaUserId } = await resolveProyectoAcceso(
    client,
    userId,
    idParsed.data,
  );

  // Determinar destinatario: si es el junior, el destinatario es el empresario y viceversa.
  const idDestinatario = userId === juniorId ? empresaUserId : juniorId;

  const { data, error } = await client
    .from("mensaje")
    .insert({
      id_proyecto: idParsed.data,
      id_remitente: userId,
      id_destinatario: idDestinatario,
      contenido: bodyParsed.data.contenido,
      es_publico: false,
    })
    .select(
      "id, contenido, es_publico, fecha_envio, remitente:users!mensaje_id_remitente_fkey(id, nombre, apellido1), id_destinatario",
    )
    .single();
  if (error) throw new ApiError(400, error.message);

  res.status(201).json({ mensaje: data });
}

router.get("/proyecto/:id", authenticate, asyncHandler(listMensajes));
router.post("/proyecto/:id", authenticate, asyncHandler(enviarMensaje));

export default router;
