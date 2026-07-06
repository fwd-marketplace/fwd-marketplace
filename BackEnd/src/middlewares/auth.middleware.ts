import { getUserFromToken } from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

/**
 * Protege rutas: lee `Authorization: Bearer <access_token>`, valida el token
 * contra Supabase Auth e inyecta `req.user`. Si falta o es inválido, responde 401.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Token no proporcionado");
  }

  const token = header.slice("Bearer ".length).trim();
  req.user = await getUserFromToken(token);
  req.accessToken = token;
  next();
});

/**
 * Middleware opcional: si llega un Bearer token válido lo inyecta en req.user/
 * req.accessToken (igual que `authenticate`), pero si no hay token o es inválido
 * simplemente continúa sin usuario. Usado en rutas públicas que quieren saber
 * quién llama cuando están autenticados (ej. perfil público del junior).
 */
export const optionalAuthenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();
    try {
      req.user = await getUserFromToken(token);
      req.accessToken = token;
    } catch {
      // Token inválido o expirado — continúa como anónimo.
    }
  }
  next();
});
