import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { updateMyPerfil } from "../services/perfil.service";

/** Token + id del usuario autenticado (los inyecta `authenticate`). */
function requireAuth(req: Request): { token: string; userId: string } {
  if (!req.accessToken || !req.user) {
    throw new ApiError(401, "No autenticado");
  }
  return { token: req.accessToken, userId: req.user.id };
}

/** PATCH /api/users/me/perfil (el usuario edita su propio perfil) */
export async function updateMe(req: Request, res: Response) {
  const { token, userId } = requireAuth(req);
  const perfil = await updateMyPerfil(token, userId, req.body);
  res.status(200).json({ perfil });
}
