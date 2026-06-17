import type { Request, Response } from "express";
import { z } from "zod";
import { ApiError } from "../utils/ApiError";
import {
  listPendingUsers,
  listStudentUsers,
  approveUser,
  rejectUser,
  suspendUser,
  listAllProjects,
  cancelProject,
} from "../services/admin.service";

function getToken(req: Request): string {
  if (!req.accessToken) throw new ApiError(401, "No autenticado");
  return req.accessToken;
}

function readUuid(value: unknown, label: string): string {
  const parsed = z.string().uuid().safeParse(value);
  if (!parsed.success) throw new ApiError(400, `El id ${label} no es válido`);
  return parsed.data;
}

/** GET /api/admin/users/pending */
export async function listPending(req: Request, res: Response) {
  const users = await listPendingUsers(getToken(req));
  res.status(200).json({ users });
}

/** GET /api/admin/users/estudiantes */
export async function listStudents(req: Request, res: Response) {
  const users = await listStudentUsers(getToken(req));
  res.status(200).json({ users });
}

/** PATCH /api/admin/users/:id/aprobar */
export async function approve(req: Request, res: Response) {
  const id = readUuid(req.params.id, "del usuario");
  const user = await approveUser(getToken(req), id);
  res.status(200).json({ user });
}

/** PATCH /api/admin/users/:id/rechazar */
export async function reject(req: Request, res: Response) {
  const id = readUuid(req.params.id, "del usuario");
  const user = await rejectUser(getToken(req), id);
  res.status(200).json({ user });
}

/** PATCH /api/admin/users/:id/suspender */
export async function suspend(req: Request, res: Response) {
  const id = readUuid(req.params.id, "del usuario");
  const user = await suspendUser(getToken(req), id);
  res.status(200).json({ user });
}

/** GET /api/admin/projects */
export async function listProjects(req: Request, res: Response) {
  const projects = await listAllProjects(getToken(req));
  res.status(200).json({ projects });
}

/** PATCH /api/admin/projects/:id/cancelar */
export async function cancel(req: Request, res: Response) {
  const id = readUuid(req.params.id, "del proyecto");
  const project = await cancelProject(getToken(req), id);
  res.status(200).json({ project });
}
