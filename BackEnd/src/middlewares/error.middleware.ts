import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

/** 404 para cualquier ruta no registrada. */
export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

/**
 * Manejador central de errores. Debe registrarse al final, después de
 * las rutas. Convierte cualquier error en una respuesta JSON uniforme.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error("[error inesperado]", err);
  const message = err instanceof Error ? err.message : "Error interno del servidor";
  res.status(500).json({ error: message });
}
