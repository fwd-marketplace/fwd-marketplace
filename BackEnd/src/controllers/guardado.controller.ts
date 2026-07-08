import type { Request, Response } from "express";
import { z } from "zod";
import { ApiError } from "../utils/ApiError";
import { listGuardados, listGuardadosIds, guardarProyecto, eliminarGuardado } from "../services/guardado.service";

const uuidSchema = z.string().uuid();

function readAuth(req: Request): { token: string; userId: string } {
  if (!req.accessToken || !req.user) throw new ApiError(401, "No autenticado");
  return { token: req.accessToken, userId: req.user.id };
}

function readProjectId(req: Request): string {
  const parsed = uuidSchema.safeParse(req.params.proyectoId);
  if (!parsed.success) throw new ApiError(400, "El id del proyecto no es válido");
  return parsed.data;
}

/** GET /api/guardados — lista proyectos guardados (completos). */
export async function list(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const proyectos = await listGuardados(token, userId);
  res.json({ proyectos });
}

/** GET /api/guardados/ids — solo los ids (ligero, para el marketplace). */
export async function listIds(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const ids = await listGuardadosIds(token, userId);
  res.json({ ids });
}

/** POST /api/guardados/:proyectoId — guarda un proyecto. */
export async function save(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const proyectoId = readProjectId(req);
  await guardarProyecto(token, userId, proyectoId);
  res.status(204).end();
}

/** DELETE /api/guardados/:proyectoId — elimina un proyecto guardado. */
export async function remove(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const proyectoId = readProjectId(req);
  await eliminarGuardado(token, userId, proyectoId);
  res.status(204).end();
}
