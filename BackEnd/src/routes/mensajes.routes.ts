import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { supabaseForToken } from "../config/supabase";
import {
  crearNotificacion,
  MENSAJES_NOTIFICACION,
  TIPO_POR_MENSAJE,
} from "../services/notificacion.service";

const router = Router();

const idParamSchema = z.string().uuid();
const enviarMensajeSchema = z.object({
  contenido: z.string().min(1).max(5000),
  id_destinatario: z.string().uuid().optional(),
});

/** Campos que se retornan en cada mensaje (incluye info del destinatario para multi-tab empresa). */
const MSG_SELECT =
  "id, contenido, es_publico, fecha_envio, " +
  "remitente:users!mensaje_id_remitente_fkey(id, nombre, apellido1), " +
  "destinatario_info:users!mensaje_id_destinatario_fkey(id, nombre, apellido1)";

/**
 * Resuelve quiénes participan en el chat de un proyecto.
 * - empresaUserId: dueño del proyecto.
 * - juniorIdsConOferta: juniors con oferta en cualquier estado.
 * - juniorIdsConMensaje: juniors con al menos un mensaje en el proyecto
 *   (RLS filtra lo que el cliente del llamante puede ver).
 * - todosJuniorIds: unión de los anteriores.
 */
async function resolveParticipantes(
  client: ReturnType<typeof supabaseForToken>,
  projectId: string,
): Promise<{
  empresaUserId: string;
  juniorIdsConOferta: string[];
  juniorIdsConMensaje: string[];
  todosJuniorIds: string[];
  proyectoTitulo: string;
}> {
  const { data: proyecto, error: projError } = await client
    .from("proyecto")
    .select("id, titulo, empresa:empresario(id_usuario)")
    .eq("id", projectId)
    .maybeSingle();
  if (projError) throw new ApiError(500, projError.message);
  if (!proyecto) throw new ApiError(404, "Proyecto no encontrado");

  const empresaUserId = proyecto.empresa?.id_usuario;
  if (!empresaUserId) throw new ApiError(500, "El proyecto no tiene empresa asociada");

  // Juniors con oferta (cualquier estado)
  const { data: ofertas, error: ofertaError } = await client
    .from("oferta")
    .select("id_usuario")
    .eq("id_proyecto", projectId);
  if (ofertaError) throw new ApiError(500, ofertaError.message);

  const juniorIdsConOferta = [...new Set((ofertas ?? []).map((o) => o.id_usuario))];

  // Juniors con mensajes (RLS ya filtra según quien llama)
  const { data: mensajesData } = await client
    .from("mensaje")
    .select("id_remitente, id_destinatario")
    .eq("id_proyecto", projectId);

  const juniorIdsConMensaje = [
    ...new Set(
      (mensajesData ?? [])
        .flatMap((m) => [m.id_remitente, m.id_destinatario])
        .filter((id): id is string => !!id && id !== empresaUserId),
    ),
  ];

  const todosJuniorIds = [...new Set([...juniorIdsConOferta, ...juniorIdsConMensaje])];

  return {
    empresaUserId,
    juniorIdsConOferta,
    juniorIdsConMensaje,
    todosJuniorIds,
    proyectoTitulo: proyecto.titulo ?? "",
  };
}

/** GET /api/mensajes/conversaciones — Proyectos donde el usuario tiene mensajes. */
async function listConversaciones(req: Request, res: Response) {
  if (!req.accessToken || !req.user) throw new ApiError(401, "No autenticado");

  const client = supabaseForToken(req.accessToken);

  // RLS filtra solo mensajes donde el usuario es remitente o destinatario.
  const { data, error } = await client
    .from("mensaje")
    .select("id_proyecto, fecha_envio, proyecto:proyecto(id, titulo)")
    .order("fecha_envio", { ascending: false });
  if (error) throw new ApiError(500, error.message);

  // Deduplicar por proyecto, mantener el mas reciente
  const seen = new Set<string>();
  const conversaciones = (data ?? [])
    .filter((m) => m.proyecto && !seen.has(m.id_proyecto) && !!seen.add(m.id_proyecto))
    .map((m) => ({ proyecto: m.proyecto, ultimo_mensaje: m.fecha_envio }));

  res.status(200).json({ conversaciones });
}

/** GET /api/mensajes/proyecto/:id — Mensajes de un proyecto. */
async function listMensajes(req: Request, res: Response) {
  if (!req.accessToken || !req.user) throw new ApiError(401, "No autenticado");

  const idParsed = idParamSchema.safeParse(req.params.id);
  if (!idParsed.success) throw new ApiError(400, "El id del proyecto no es válido");

  const client = supabaseForToken(req.accessToken);
  const userId = req.user.id;

  const { empresaUserId, todosJuniorIds } = await resolveParticipantes(client, idParsed.data);

  // Empresa siempre tiene acceso; junior necesita oferta o mensaje previo
  if (userId !== empresaUserId && !todosJuniorIds.includes(userId)) {
    throw new ApiError(403, "No tenés acceso a los mensajes de este proyecto");
  }

  const { data, error } = await client
    .from("mensaje")
    .select(MSG_SELECT)
    .eq("id_proyecto", idParsed.data)
    .order("fecha_envio", { ascending: true });
  if (error) throw new ApiError(500, error.message);

  res.status(200).json({ mensajes: data });
}

/** POST /api/mensajes/proyecto/:id — Enviar mensaje. */
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

  const { empresaUserId, todosJuniorIds, proyectoTitulo } = await resolveParticipantes(
    client,
    idParsed.data,
  );

  let idDestinatario: string;

  if (userId === empresaUserId) {
    // Empresa → elige a qué junior escribirle
    const elegido =
      bodyParsed.data.id_destinatario ??
      (todosJuniorIds.length === 1 ? todosJuniorIds[0] : undefined);
    if (!elegido) {
      throw new ApiError(400, "Indicá a qué junior querés escribirle");
    }
    if (!todosJuniorIds.includes(elegido)) {
      throw new ApiError(400, "El destinatario no es participante de este proyecto");
    }
    idDestinatario = elegido;
  } else {
    // Junior → siempre escribe a la empresa (sin requerir propuesta previa)
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
    .select(MSG_SELECT)
    .single();
  if (error) throw new ApiError(400, error.message);

  // Notificar al destinatario (best-effort)
  await crearNotificacion(
    req.accessToken,
    idDestinatario,
    MENSAJES_NOTIFICACION.nuevoMensaje(proyectoTitulo),
    TIPO_POR_MENSAJE.nuevoMensaje,
  );

  res.status(201).json({ mensaje: data });
}

router.get("/conversaciones", authenticate, asyncHandler(listConversaciones));
router.get("/proyecto/:id", authenticate, asyncHandler(listMensajes));
router.post("/proyecto/:id", authenticate, asyncHandler(enviarMensaje));

export default router;
