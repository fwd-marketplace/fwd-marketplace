import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { updateMyPerfil, updateMyAvatar } from "../services/perfil.service";

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

export async function updateAvatar(req: Request, res: Response) {
  const { token, userId } = requireAuth(req);
  if (!req.file) {
    throw new ApiError(400, "No se recibió ninguna imagen");
  }
  if (!req.file.mimetype.startsWith("image/")) {
    throw new ApiError(400, "El archivo debe ser una imagen");
  }
  const perfil = await updateMyAvatar(token, userId, req.file.buffer);
  res.status(200).json({ perfil });
}
