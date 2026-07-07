import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { supabaseForToken, supabaseAdmin } from "../config/supabase";
import {
  crearNotificacion,
  MENSAJES_NOTIFICACION,
  TIPO_POR_MENSAJE,
} from "../services/notificacion.service";
import { oppositeLocale, translateText } from "../services/ai/translation.service";
import { LocaleSchema } from "../validations/ai";

const router = Router();

const idParamSchema = z.string().uuid();
const enviarMensajeSchema = z.object({
  contenido: z.string().min(1).max(5000),
  id_destinatario: z.string().uuid().optional(),
  // Idioma en que el remitente escribió el mensaje; se traduce al opuesto y se guardan ambos.
  locale: LocaleSchema.default("es"),
});

/** Campos que se retornan en cada mensaje (incluye info del destinatario para multi-tab empresa). */
const MSG_SELECT =
  "id, contenido, contenido_traducido, idioma_original, es_publico, fecha_envio, " +
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

  const userId = req.user.id;

  // Usamos supabaseAdmin para evitar que el RLS de `proyecto` bloquee el join
  // cuando el proyecto está en un estado no visible para el usuario (pausado, etc.).
  // El RLS de `mensaje` se aplica vía filtro manual: solo los mensajes donde el
  // usuario es remitente o destinatario.
  const admin = supabaseAdmin();

  const { data, error } = await admin
    .from("mensaje")
    .select("id_proyecto, fecha_envio, id_remitente, id_destinatario, leida, proyecto:proyecto(id, titulo)")
    .or(`id_remitente.eq.${userId},id_destinatario.eq.${userId}`)
    .order("fecha_envio", { ascending: false });
  if (error) throw new ApiError(500, error.message);

  const msgs = data ?? [];

  // Deduplicar por proyecto, mantener el más reciente, contar participantes únicos
  // y los mensajes recibidos sin leer (no_leidos) para marcar chats pendientes.
  const seen = new Set<string>();
  const conversaciones = msgs
    .filter((m) => m.id_proyecto && !seen.has(m.id_proyecto) && !!seen.add(m.id_proyecto))
    .map((m) => {
      const msgsForProject = msgs.filter((x) => x.id_proyecto === m.id_proyecto);
      const uniqueSenders = new Set(
        msgsForProject.map((x) => x.id_remitente).filter((id): id is string => !!id && id !== userId),
      );
      const noLeidos = msgsForProject.filter(
        (x) => x.id_destinatario === userId && !x.leida,
      ).length;
      const proyecto = (m.proyecto as { id: string; titulo: string } | null);
      return {
        proyecto: proyecto ?? { id: m.id_proyecto, titulo: "Proyecto" },
        ultimo_mensaje: m.fecha_envio,
        n_participantes: uniqueSenders.size,
        no_leidos: noLeidos,
      };
    });

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

  // Al abrir el chat, marcar como leídos los mensajes que recibió el usuario
  // (limpia el indicador de "pendiente" en gestión). Se usa service role porque
  // mensaje no tiene política RLS de UPDATE. Best-effort: no bloquea la respuesta.
  void supabaseAdmin()
    .from("mensaje")
    .update({ leida: true })
    .eq("id_proyecto", idParsed.data)
    .eq("id_destinatario", userId)
    .eq("leida", false)
    .then(({ error: updateError }) => {
      if (updateError) {
        logger.warn("marcar mensajes leidos fallo (best-effort)", { error: updateError.message });
      }
    });

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

  // Traducir al idioma opuesto y guardar ambas versiones (best-effort: null si la IA falla).
  const idiomaOriginal = bodyParsed.data.locale;
  const contenidoTraducido = await translateText(
    bodyParsed.data.contenido,
    idiomaOriginal,
    oppositeLocale(idiomaOriginal),
  );

  const { data, error } = await client
    .from("mensaje")
    .insert({
      id_proyecto: idParsed.data,
      id_remitente: userId,
      id_destinatario: idDestinatario,
      contenido: bodyParsed.data.contenido,
      contenido_traducido: contenidoTraducido,
      idioma_original: idiomaOriginal,
      es_publico: false,
    })
    .select(MSG_SELECT)
    .single();
  if (error) throw new ApiError(400, error.message);

  // Notificar al destinatario (best-effort). id_referencia = proyecto, para que la
  // campanita lleve directo al chat de ese proyecto.
  await crearNotificacion(
    req.accessToken,
    idDestinatario,
    MENSAJES_NOTIFICACION.nuevoMensaje(proyectoTitulo),
    TIPO_POR_MENSAJE.nuevoMensaje,
    idParsed.data,
  );

  res.status(201).json({ mensaje: data });
}

router.get("/conversaciones", authenticate, asyncHandler(listConversaciones));
router.get("/proyecto/:id", authenticate, asyncHandler(listMensajes));
router.post("/proyecto/:id", authenticate, asyncHandler(enviarMensaje));

export default router;
