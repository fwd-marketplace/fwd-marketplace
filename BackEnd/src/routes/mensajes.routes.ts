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
  // Opcional: si el proyecto tiene varios adjudicados, la empresa indica a cual escribirle.
  id_destinatario: z.string().uuid().optional(),
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
): Promise<{ juniorIds: string[]; empresaUserId: string }> {
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
  // Se traen todas las ofertas del proyecto y se filtra en memoria para evitar
  // el error de .maybeSingle() cuando hay múltiples postulantes.
  const { data: ofertas, error: ofertaError } = await client
    .from("oferta")
    .select("id_usuario, estado:estado_oferta(nombre)")
    .eq("id_proyecto", projectId);
  if (ofertaError) throw new ApiError(500, ofertaError.message);

  // Puede haber MAS de un junior adjudicado (la empresa eligio varias propuestas).
  const juniorIds = [
    ...new Set(
      (ofertas ?? [])
        .filter((oferta) => oferta.estado?.nombre === "adjudicada")
        .map((oferta) => oferta.id_usuario),
    ),
  ];

  // Verificar acceso: el dueño del proyecto o CUALQUIER junior adjudicado.
  if (userId !== empresaUserId && !juniorIds.includes(userId)) {
    throw new ApiError(403, "No tenés acceso a los mensajes de este proyecto");
  }

  if (juniorIds.length === 0) {
    throw new ApiError(409, "Este proyecto aún no tiene un junior adjudicado");
  }

  return { juniorIds, empresaUserId };
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

  const { juniorIds, empresaUserId } = await resolveProyectoAcceso(
    client,
    userId,
    idParsed.data,
  );

  // Destinatario: un junior siempre le escribe a la empresa. La empresa, si hay varios
  // adjudicados, indica a cual (id_destinatario); con uno solo, se resuelve por defecto.
  let idDestinatario: string;
  if (userId === empresaUserId) {
    const elegido =
      bodyParsed.data.id_destinatario ?? (juniorIds.length === 1 ? juniorIds[0] : undefined);
    if (!elegido) {
      throw new ApiError(400, "Indicá a qué junior adjudicado querés escribirle");
    }
    if (!juniorIds.includes(elegido)) {
      throw new ApiError(400, "El destinatario no es un junior adjudicado de este proyecto");
    }
    idDestinatario = elegido;
  } else {
    idDestinatario = empresaUserId;
  }

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
