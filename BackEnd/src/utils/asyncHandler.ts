import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Envuelve un controlador async para que cualquier error (incluido un
 * `throw` o una promesa rechazada) llegue automáticamente al middleware
 * de errores, sin tener que repetir try/catch en cada controlador.
 *
 *   router.post("/register", asyncHandler(register));
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
