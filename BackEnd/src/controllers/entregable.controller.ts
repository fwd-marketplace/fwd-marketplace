import type { Request, Response } from "express";
import { z } from "zod";
import { ApiError } from "../utils/ApiError";
import {
  submitEntregable,
  listMyEntregables,
  listProjectEntregables,
  reviewEntregable,
} from "../services/entregable.service";

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

const SubmitEntregableSchema = z.object({
  id_proyecto: z.string().uuid(),
  url: z.string().min(1).max(500),
  url_github: z.string().max(500).optional(),
  tipo: z.enum(["parcial", "final"]),
});

const ReviewEntregableSchema = z.object({
  accion: z.enum(["revisar", "aprobar", "solicitar_cambios"]),
  comentario: z.string().optional(),
});

/** POST /api/entregables (junior envía entregable) */
export async function submit(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const parsed = SubmitEntregableSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  const entregable = await submitEntregable(token, userId, parsed.data);
  res.status(201).json({ entregable });
}

/** GET /api/entregables/mios (junior ve sus entregables) */
export async function listMine(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const entregables = await listMyEntregables(token, userId);
  res.status(200).json({ entregables });
}

/** GET /api/projects/:id/entregables (empresa ve los entregables de su proyecto) */
export async function listForProject(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const projectId = readUuidParam(req.params.id, "del proyecto");
  const entregables = await listProjectEntregables(token, userId, projectId);
  res.status(200).json({ entregables });
}

/** PATCH /api/entregables/:id (empresa revisa/aprueba/solicita cambios) */
export async function review(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const entregableId = readUuidParam(req.params.id, "del entregable");
  const parsed = ReviewEntregableSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  const entregable = await reviewEntregable(
    token,
    userId,
    entregableId,
    parsed.data.accion,
    parsed.data.comentario,
  );
  res.status(200).json({ entregable });
}
