import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { listPendingUsers, approveUser } from "../services/admin.service";

function getToken(req: Request): string {
  if (!req.accessToken) throw new ApiError(401, "No autenticado");
  return req.accessToken;
}

/** GET /api/admin/users/pending */
export async function listPending(req: Request, res: Response) {
  const users = await listPendingUsers(getToken(req));
  res.status(200).json({ users });
}

/** PATCH /api/admin/users/:id/aprobar */
export async function approve(req: Request, res: Response) {
  const id = req.params.id;
  if (typeof id !== "string" || !id) {
    throw new ApiError(400, "Falta el id del usuario");
  }
  const user = await approveUser(getToken(req), id);
  res.status(200).json({ user });
}
