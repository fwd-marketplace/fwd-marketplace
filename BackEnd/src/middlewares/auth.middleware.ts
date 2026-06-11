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
  // Guardamos el token para que los services puedan crear un cliente Supabase
  // con la identidad del usuario (necesario para que el RLS aplique por usuario).
  req.accessToken = token;
  next();
});
