import type { Request, Response } from "express";
import { z } from "zod";
import * as projectService from "../services/proyecto.service";
import { ApiError } from "../utils/ApiError";
import { CreateProjectSchema, ChangeProjectStateSchema } from "../validations/project";

/** Filtros aceptados en GET /api/projects (query string). */
const listQuerySchema = z.object({
  area: z.string().uuid().optional(),
  skill: z.string().uuid().optional(),
  plazoMax: z.coerce.number().int().min(5).max(15).optional(),
  q: z.string().trim().min(1).max(100).optional(),
});

/** El id de la ruta debe ser un UUID. */
const idParamSchema = z.string().uuid();

/** Lee el token que dejó el middleware de autenticación. */
function readToken(req: Request): string {
  const token = req.accessToken;
  if (!token) {
    throw new ApiError(401, "No autenticado");
  }
  return token;
}

/** GET /api/projects (ruta protegida) */
export async function list(req: Request, res: Response) {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Parámetros inválidos");
  }

  const projects = await projectService.listProjects(readToken(req), parsed.data);
  res.status(200).json({ projects });
}

/** GET /api/projects/mias (ruta protegida — empresa) */
export async function listMine(req: Request, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "No autenticado");
  }
  const projects = await projectService.listMyProjects(readToken(req), req.user.id);
  res.status(200).json({ projects });
}

/** GET /api/projects/:id (ruta protegida) */
export async function detail(req: Request, res: Response) {
  const parsed = idParamSchema.safeParse(req.params.id);
  if (!parsed.success) {
    throw new ApiError(400, "El id del proyecto no es válido");
  }

  const project = await projectService.getProjectById(readToken(req), parsed.data);
  res.status(200).json({ project });
}

/** POST /api/projects (ruta protegida — empresa) */
export async function create(req: Request, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "No autenticado");
  }
  const parsed = CreateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const project = await projectService.createProject(readToken(req), req.user.id, parsed.data);
  res.status(201).json({ project });
}

/** PATCH /api/projects/:id/estado (ruta protegida — empresa dueña) */
export async function changeState(req: Request, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "No autenticado");
  }
  const idParsed = idParamSchema.safeParse(req.params.id);
  if (!idParsed.success) {
    throw new ApiError(400, "El id del proyecto no es válido");
  }
  const bodyParsed = ChangeProjectStateSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    throw new ApiError(400, bodyParsed.error.issues[0]?.message ?? "Estado inválido");
  }

  const project = await projectService.changeProjectState(
    readToken(req),
    req.user.id,
    idParsed.data,
    bodyParsed.data,
  );
  res.status(200).json({ project });
}
