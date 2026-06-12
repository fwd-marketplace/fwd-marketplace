import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { getCatalogs } from "../services/catalog.service";

/** GET /api/catalogs */
export async function catalogs(req: Request, res: Response) {
  if (!req.accessToken) {
    throw new ApiError(401, "No autenticado");
  }
  const data = await getCatalogs(req.accessToken);
  res.status(200).json(data);
}
