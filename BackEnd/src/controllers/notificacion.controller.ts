import type { Request, Response } from "express";
import { z } from "zod";
import { ApiError } from "../utils/ApiError";
import {
  listMyNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
} from "../services/notificacion.service";

const idParamSchema = z.string().uuid();

/** Token + id del usuario autenticado. */
function readAuth(req: Request): { token: string; userId: string } {
  if (!req.accessToken || !req.user) {
    throw new ApiError(401, "No autenticado");
  }
  return { token: req.accessToken, userId: req.user.id };
}

/** GET /api/notificaciones — Notificaciones del usuario autenticado. */
export async function listMine(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const notificaciones = await listMyNotificaciones(token, userId);
  res.status(200).json({ notificaciones });
}

/** PATCH /api/notificaciones/:id/leida — Marca una notificacion como leida. */
export async function marcarUnaLeida(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const parsed = idParamSchema.safeParse(req.params.id);
  if (!parsed.success) {
    throw new ApiError(400, "El id de la notificación no es válido");
  }
  const notificacion = await marcarLeida(token, userId, parsed.data);
  res.status(200).json({ notificacion });
}

/** PATCH /api/notificaciones/leidas — Marca todas las notificaciones como leidas. */
export async function marcarTodas(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const result = await marcarTodasLeidas(token, userId);
  res.status(200).json(result);
}
