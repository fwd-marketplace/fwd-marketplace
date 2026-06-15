import type { Request, Response } from "express";
import { z } from "zod";
import { ApiError } from "../utils/ApiError";
import { CreateOfertaSchema, DecideOfertaSchema } from "../validations/oferta";
import {
  createOferta,
  listMyOfertas,
  listProjectOfertas,
  decideOferta,
} from "../services/oferta.service";

const idParamSchema = z.string().uuid();

/** Token + id del usuario autenticado. */
function readAuth(req: Request): { token: string; userId: string } {
  if (!req.accessToken || !req.user) {
    throw new ApiError(401, "No autenticado");
  }
  return { token: req.accessToken, userId: req.user.id };
}

function readUuidParam(value: unknown, label: string): string {
  const parsed = idParamSchema.safeParse(value);
  if (!parsed.success) {
    throw new ApiError(400, `El id ${label} no es válido`);
  }
  return parsed.data;
}

/** POST /api/projects/:id/ofertas (junior postula) */
export async function createForProject(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const projectId = readUuidParam(req.params.id, "del proyecto");
  const parsed = CreateOfertaSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  const oferta = await createOferta(token, userId, projectId, parsed.data);
  res.status(201).json({ oferta });
}

/** GET /api/projects/:id/ofertas (empresa ve las postulaciones de su proyecto) */
export async function listForProject(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const projectId = readUuidParam(req.params.id, "del proyecto");
  const ofertas = await listProjectOfertas(token, userId, projectId);
  res.status(200).json({ ofertas });
}

/** GET /api/ofertas/mias (mis postulaciones — junior) */
export async function listMine(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const ofertas = await listMyOfertas(token, userId);
  res.status(200).json({ ofertas });
}

/** PATCH /api/ofertas/:id (empresa acepta/rechaza) */
export async function decide(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const ofertaId = readUuidParam(req.params.id, "de la postulación");
  const parsed = DecideOfertaSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Acción inválida");
  }
  const oferta = await decideOferta(token, userId, ofertaId, parsed.data);
  res.status(200).json({ oferta });
}
