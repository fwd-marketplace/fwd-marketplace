import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { supabaseForToken } from "../config/supabase";

const router = Router();

const rankingQuerySchema = z.object({
  especialidad: z.enum(["frontend", "backend", "fullstack", "ia"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** GET /api/ranking — Ranking de juniors ordenado por reputación. */
async function getRanking(req: Request, res: Response) {
  if (!req.accessToken || !req.user) {
    throw new ApiError(401, "No autenticado");
  }

  const parsed = rankingQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Parámetros inválidos");
  }
  const { especialidad, limit } = parsed.data;

  const client = supabaseForToken(req.accessToken);

  let query = client
    .from("estudiante")
    .select(
      "id, especialidad, reputacion, usuario:users(id, nombre, apellido1), skills:student_skills(skill:skills(id, nombre, tipo))",
    )
    .not("reputacion", "is", null)
    .order("reputacion", { ascending: false })
    .limit(limit);

  if (especialidad) {
    query = query.eq("especialidad", especialidad);
  }

  const { data, error } = await query;
  if (error) throw new ApiError(500, error.message);

  res.status(200).json({ juniors: data });
}

router.get("/", authenticate, asyncHandler(getRanking));

export default router;
