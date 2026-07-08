import type { Request, Response } from "express";
import * as estudianteService from "../services/estudiante.service";
import { SearchStudentsSchema } from "../validations/estudiante";
import { ApiError } from "../utils/ApiError";

/** Lee el token que dejó el middleware de autenticación. */
function readToken(req: Request): string {
  const token = req.accessToken;
  if (!token) {
    throw new ApiError(401, "No autenticado");
  }
  return token;
}

/**
 * GET /api/students/search — directorio de talento para empresas/emprendedores.
 * El RLS limita los resultados a estudiantes verificados y solo para company/admin.
 */
export async function search(req: Request, res: Response) {
  const parsed = SearchStudentsSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Parámetros inválidos");
  }

  const students = await estudianteService.searchStudents(readToken(req), parsed.data);
  res.status(200).json({ students });
}
