import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Registra cada request cuando la respuesta termina: método, ruta, código de
 * estado y duración en ms. Usa el logger estructurado (sin `console.*`). Se
 * coloca temprano en la cadena para medir el tiempo total de la petición.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on("finish", () => {
    logger.info("request", {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
    });
  });

  next();
}