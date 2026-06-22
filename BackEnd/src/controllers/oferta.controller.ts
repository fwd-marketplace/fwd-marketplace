import type { Request, Response } from "express";
import { z } from "zod";
import { ApiError } from "../utils/ApiError";
import {
  CreateOfertaSchema,
  DecideOfertaSchema,
  ReviewOfertaSchema,
  CalificarOfertaSchema,
  ReplicarCalificacionSchema,
  EditOfertaSchema,
} from "../validations/oferta";
import {
  createOferta,
  listMyOfertas,
  listMyCalificaciones,
  listProjectOfertas,
  getOfertaContacto,
  decideOferta,
  reviewOferta,
  editOferta,
  withdrawOferta,
  calificarOferta,
  replicarCalificacion,
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

/** GET /api/ofertas/mis-calificaciones (calificaciones recibidas — junior) */
export async function listMisCalificaciones(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const calificaciones = await listMyCalificaciones(token, userId);
  res.status(200).json({ calificaciones });
}

/** GET /api/ofertas/:id (empresa dueña ve la postulación con el contacto del junior) */
export async function getOne(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const ofertaId = readUuidParam(req.params.id, "de la postulación");
  const oferta = await getOfertaContacto(token, userId, ofertaId);
  res.status(200).json({ oferta });
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

/** PATCH /api/ofertas/:id/revisar (empresa revisa: cambia estado y deja comentario) */
export async function review(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const ofertaId = readUuidParam(req.params.id, "de la postulación");
  const parsed = ReviewOfertaSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Acción inválida");
  }
  const oferta = await reviewOferta(token, userId, ofertaId, parsed.data);
  res.status(200).json({ oferta });
}

/** PATCH /api/ofertas/:id/editar (junior edita su propuesta si aún está en "enviada") */
export async function edit(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const ofertaId = readUuidParam(req.params.id, "de la postulación");
  const parsed = EditOfertaSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  const oferta = await editOferta(token, userId, ofertaId, parsed.data);
  res.status(200).json({ oferta });
}

/** DELETE /api/ofertas/:id/retirar (junior retira su postulación) */
export async function withdraw(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const ofertaId = readUuidParam(req.params.id, "de la postulación");
  await withdrawOferta(token, userId, ofertaId);
  res.status(200).json({ ok: true });
}

/** POST /api/ofertas/:id/calificar (empresa califica al junior) */
export async function calificar(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const ofertaId = readUuidParam(req.params.id, "de la postulación");
  const parsed = CalificarOfertaSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  const oferta = await calificarOferta(token, userId, ofertaId, parsed.data);
  res.status(200).json({ oferta });
}

/** POST /api/ofertas/:id/replica (junior replica a su calificación) */
export async function replica(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const ofertaId = readUuidParam(req.params.id, "de la postulación");
  const parsed = ReplicarCalificacionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  const oferta = await replicarCalificacion(token, userId, ofertaId, parsed.data);
  res.status(200).json({ oferta });
}
