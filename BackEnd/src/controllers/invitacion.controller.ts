import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { misInvitaciones } from "../services/invitacion.service";

/** Token + id del usuario autenticado. */
function readAuth(req: Request): { token: string; userId: string } {
  if (!req.accessToken || !req.user) {
    throw new ApiError(401, "No autenticado");
  }
  return { token: req.accessToken, userId: req.user.id };
}

/** GET /api/invitaciones/mias — Invitaciones que recibió el estudiante autenticado. */
export async function listMine(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const invitaciones = await misInvitaciones(token, userId);
  res.status(200).json({ invitaciones });
}
