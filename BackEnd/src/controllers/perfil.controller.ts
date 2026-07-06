import type { Request, Response } from "express";
import { z } from "zod";
import { ApiError } from "../utils/ApiError";
import {
  getMyPerfil,
  updateMyPerfil,
  updateMyAvatar,
  removeMyAvatar,
  uploadMyLogo,
  deleteMyLogo,
  savePreferenciasNotificacion,
  getMyPortafolio,
  createPortafolioItem,
  updatePortafolioItem,
  deletePortafolioItem,
  getPublicEmpresaProfile,
  getPublicEmpresaProjects,
  listEmpresasActivas,
  getPublicJuniorProfile,
} from "../services/perfil.service";

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

/** DELETE /api/users/me/perfil/avatar (junior elimina su avatar) */
export async function removeAvatar(req: Request, res: Response) {
  const { token, userId } = requireAuth(req);
  await removeMyAvatar(token, userId);
  res.status(204).send();
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

/** GET /api/users/me/perfil/portafolio */
export async function listPortafolio(req: Request, res: Response) {
  const { token, userId } = requireAuth(req);
  const items = await getMyPortafolio(token, userId);
  res.status(200).json({ items });
}

/** POST /api/users/me/perfil/portafolio */
export async function addPortafolioItem(req: Request, res: Response) {
  const { token, userId } = requireAuth(req);
  const item = await createPortafolioItem(token, userId, req.body);
  res.status(201).json({ item });
}

/** PATCH /api/users/me/perfil/portafolio/:id */
export async function editPortafolioItem(req: Request, res: Response) {
  const { token, userId } = requireAuth(req);
  const id = req.params["id"] as string;
  if (!id) throw new ApiError(400, "id requerido");
  const item = await updatePortafolioItem(token, userId, id, req.body);
  res.status(200).json({ item });
}

/** DELETE /api/users/me/perfil/portafolio/:id */
export async function removePortafolioItem(req: Request, res: Response) {
  const { token, userId } = requireAuth(req);
  const id = req.params["id"] as string;
  if (!id) throw new ApiError(400, "id requerido");
  await deletePortafolioItem(token, userId, id);
  res.status(204).send();
}

/** GET /api/perfil/empresas — directorio público de empresas con proyectos publicados */
export async function getPublicEmpresas(_req: Request, res: Response) {
  const empresas = await listEmpresasActivas();
  res.status(200).json({ empresas });
}

/** GET /api/perfil/empresa/:id — perfil público de empresa/emprendedor */
export async function getPublicEmpresa(req: Request, res: Response) {
  const id = String(req.params["id"] ?? "");
  if (!id) throw new ApiError(400, "id requerido");
  const perfil = await getPublicEmpresaProfile(id);
  res.status(200).json({ perfil });
}

/** GET /api/perfil/empresa/:id/proyectos — proyectos públicos de una empresa */
export async function getPublicEmpresaProyectos(req: Request, res: Response) {
  const id = String(req.params["id"] ?? "");
  if (!id) throw new ApiError(400, "id requerido");
  const proyectos = await getPublicEmpresaProjects(id);
  res.status(200).json({ proyectos });
}

/** GET /api/perfil/junior/:id — perfil público de junior */
export async function getPublicJunior(req: Request, res: Response) {
  const id = String(req.params["id"] ?? "");
  if (!id) throw new ApiError(400, "id requerido");
  const perfil = await getPublicJuniorProfile(id);
  res.status(200).json({ perfil });
}

const preferenciasSchema = z.record(z.string(), z.boolean());

/** PATCH /api/users/me/perfil/preferencias-notificacion (guarda preferencias del usuario) */
export async function updatePreferenciasNotificacion(req: Request, res: Response) {
  const { token, userId } = requireAuth(req);
  const parsed = preferenciasSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  const result = await savePreferenciasNotificacion(token, userId, parsed.data);
  res.status(200).json(result);
}
