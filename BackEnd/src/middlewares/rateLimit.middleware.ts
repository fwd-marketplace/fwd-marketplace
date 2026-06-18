import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

type Hit = { count: number; resetAt: number };

export interface RateLimitOptions {
  /** Tamaño de la ventana en milisegundos. */
  windowMs: number;
  /** Máximo de peticiones permitidas por clave dentro de la ventana. */
  max: number;
  /** Mensaje del error 429 (opcional). */
  message?: string;
  /**
   * Cómo derivar la clave de cupo. Por defecto, la IP del cliente (rutas de auth
   * sin sesión). Para rutas autenticadas se puede keyear por usuario/empresa
   * (p. ej. `(req) => req.user?.id ?? req.ip`).
   */
  keyResolver?: (req: Request) => string;
}

/**
 * Rate limiter in-memory por IP, pensado para rutas de auth (frenar fuerza
 * bruta de login, enumeración/bombing del reset y spam de registro). Cada
 * llamada a `rateLimit()` mantiene su propio contador, así que cada ruta tiene
 * su propio cupo.
 *
 * Limitaciones asumidas a propósito (suficiente para el despliegue actual):
 *  - Single-instance: el estado vive en memoria y se reinicia con el server;
 *    no se comparte entre réplicas.
 *  - Usa `req.ip`. Detrás de un proxy/balanceador hay que habilitar
 *    `app.set("trust proxy", ...)` para que sea la IP real del cliente (y solo
 *    si el proxy es de confianza, para que no se pueda spoofear X-Forwarded-For).
 */
export function rateLimit({
  windowMs,
  max,
  message = "Demasiados intentos. Esperá un momento e intentá de nuevo.",
  keyResolver,
}: RateLimitOptions) {
  const hits = new Map<string, Hit>();
  let lastSweep = 0;

  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
    const now = Date.now();
    const key = keyResolver
      ? keyResolver(req)
      : (req.ip ?? req.socket.remoteAddress ?? "unknown");

    // Limpieza oportunista de entradas vencidas para que el Map no crezca sin fin.
    if (now - lastSweep > windowMs) {
      for (const [k, v] of hits) {
        if (now >= v.resetAt) hits.delete(k);
      }
      lastSweep = now;
    }

    let hit = hits.get(key);
    if (!hit || now >= hit.resetAt) {
      hit = { count: 0, resetAt: now + windowMs };
      hits.set(key, hit);
    }
    hit.count += 1;

    if (hit.count > max) {
      const retryAfterSec = Math.ceil((hit.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSec));
      next(new ApiError(429, message));
      return;
    }

    next();
  };
}