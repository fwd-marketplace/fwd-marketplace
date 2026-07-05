import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { getHeroJourney } from "../services/heroJourney.service";

function readAuth(req: Request): { token: string; userId: string } {
  if (!req.accessToken || !req.user) throw new ApiError(401, "No autenticado");
  return { token: req.accessToken, userId: req.user.id };
}

/** GET /api/junior/hero-journey */
export async function getHeroJourneyController(req: Request, res: Response) {
  const { token, userId } = readAuth(req);
  const journey = await getHeroJourney(token, userId, req.user!);
  res.json(journey);
}
