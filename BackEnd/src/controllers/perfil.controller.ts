import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { getMyPerfil, updateMyPerfil, updateMyAvatar, uploadMyLogo, deleteMyLogo } from "../services/perfil.service";

/** Token + id del usuario autenticado (los inyecta `authenticate`). */
function requireAuth(req: Request): { token: string; userId: string } {
  if (!req.accessToken || !req.user) {
    throw new ApiError(401, "No autenticado");
  }
  return { token: req.accessToken, userId: req.user.id };
}

/** GET /api/users/me/perfil (el usuario ve su propio perfil para editarlo) */
export async function getMe(req: Request, res: Response) {
  const { token, userId } = requireAuth(req);
  const perfil = await getMyPerfil(token, userId);
  res.status(200).json({ perfil });
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

/** DELETE /api/users/me/perfil/logo (empresa elimina su logo) */
export async function removeLogo(req: Request, res: Response) {
  const { token, userId } = requireAuth(req);
  await deleteMyLogo(token, userId);
  res.status(204).send();
}

/** POST /api/users/me/perfil/logo (empresa sube su logo) */
export async function uploadLogo(req: Request, res: Response) {
  const { token, userId } = requireAuth(req);
  if (!req.file) {
    throw new ApiError(400, "No se recibió ninguna imagen");
  }
  if (!req.file.mimetype.startsWith("image/")) {
    throw new ApiError(400, "El archivo debe ser una imagen");
  }
  const result = await uploadMyLogo(token, userId, req.file.buffer, req.file.size);
  res.status(200).json(result);
}
