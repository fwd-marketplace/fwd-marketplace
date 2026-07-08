import type { Request, Response } from "express";
import { z } from "zod";
import { ApiError } from "../utils/ApiError";
import { getProgress, upsertProgress } from "../services/viaje.service";

function readAuth(req: Request): { token: string; userId: string } {
  if (!req.accessToken || !req.user) throw new ApiError(401, "No autenticado");
  return { token: req.accessToken, userId: req.user.id };
}

const upsertBodySchema = z.object({
  mastery: z.number().int().min(1).max(3),
});

/** GET /api/viaje/progress */
export async function getProgressController(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const progress = await getProgress(token, userId);
  res.json({ progress });
}

/** PUT /api/viaje/progress/:starId */
export async function upsertProgressController(req: Request, res: Response) {
  const { token, userId } = readAuth(req);

  const starId = String(req.params.starId ?? "");
  if (!starId.trim()) throw new ApiError(400, "starId inválido");

  const parsed = upsertBodySchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "mastery debe ser un entero entre 1 y 3");

  await upsertProgress(token, userId, starId, parsed.data.mastery);
  res.status(204).end();
}
