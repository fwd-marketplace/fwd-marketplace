import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

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
  const isApiError = err instanceof ApiError;

  // Blinda contra códigos inválidos (ej. status 0 de un error de Supabase),
  // que harían que res.status() lance un RangeError y ocultara el error real.
  const status =
    isApiError &&
    Number.isInteger(err.statusCode) &&
    err.statusCode >= 100 &&
    err.statusCode <= 599
      ? err.statusCode
      : 500;

  // 5xx: NUNCA se expone el detalle interno al cliente. Muchos services propagan el
  // `error.message` crudo de Postgres/Supabase (nombres de tablas, constraints, etc.);
  // se registra el detalle real en el log y se responde un mensaje genérico.
  if (status >= 500) {
    logger.error("Error de servidor", {
      status,
      error: err instanceof Error ? { message: err.message, stack: err.stack } : err,
    });
    res.status(status).json({ error: "Error interno del servidor" });
    return;
  }

  // 4xx: mensaje controlado y útil para el usuario (validaciones, reglas de negocio).
  // Se incluye `code` (si lo hay) para que el FrontEnd traduzca el error a es/en.
  res.status(status).json({
    error: isApiError ? err.message : "Solicitud inválida",
    ...(isApiError && err.code ? { code: err.code } : {}),
  });
}
