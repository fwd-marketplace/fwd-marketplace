import type { Request, Response } from "express";
import { z } from "zod";
import { ApiError } from "../utils/ApiError";
import { parseBody } from "../utils/parseBody";
import { CrearReporteSchema, ResolverReporteSchema } from "../validations/reporte";
import {
  crearReporte as crearReporteService,
  listReportes as listReportesService,
  resolverReporte as resolverReporteService,
} from "../services/reporte.service";

/** POST /api/reportes — un participante reporta un mensaje del chat. */
export async function crearReporte(req: Request, res: Response): Promise<void> {
  if (!req.user || !req.accessToken) {
    throw new ApiError(401, "No autenticado");
  }
  const input = parseBody(CrearReporteSchema, req.body);
  const reporte = await crearReporteService(req.accessToken, req.user.id, input);
  res.status(201).json({ reporte });
}

/** GET /api/admin/reportes — lista de reportes para el panel de Moderación (solo admin). */
export async function listReportes(req: Request, res: Response): Promise<void> {
  if (!req.accessToken) {
    throw new ApiError(401, "No autenticado");
  }
  const reportes = await listReportesService(req.accessToken);
  res.status(200).json({ reportes });
}

/** PATCH /api/admin/reportes/:id/resolver — el admin marca el reporte como revisado/desestimado. */
export async function resolverReporte(req: Request, res: Response): Promise<void> {
  if (!req.user || !req.accessToken) {
    throw new ApiError(401, "No autenticado");
  }
  const idParsed = z.string().uuid().safeParse(req.params.id);
  if (!idParsed.success) {
    throw new ApiError(400, "El id del reporte no es válido");
  }
  const input = parseBody(ResolverReporteSchema, req.body);
  const reporte = await resolverReporteService(
    req.accessToken,
    req.user.id,
    idParsed.data,
    input.estado,
  );
  res.status(200).json({ reporte });
}
