import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { getJuniorDashboard } from "../services/juniorDashboard.service";

function readAuth(req: Request): { token: string; userId: string } {
  if (!req.accessToken || !req.user) throw new ApiError(401, "No autenticado");
  return { token: req.accessToken, userId: req.user.id };
}

/** GET /api/junior/dashboard */
export async function getJuniorDashboardController(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const data = await getJuniorDashboard(token, userId);
  res.json(data);
}
