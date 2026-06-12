import { supabaseForToken } from "../config/supabase";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

/**
 * Exige que el usuario autenticado tenga rol 'admin'. Debe ir DESPUÉS de
 * `authenticate`. Consulta el rol en la BD con la identidad del propio usuario
 * (RLS: puede leer su propia fila).
 */
export const requireAdmin = asyncHandler(async (req, _res, next) => {
  if (!req.accessToken || !req.user) {
    throw new ApiError(401, "No autenticado");
  }

  const client = supabaseForToken(req.accessToken);
  const { data, error } = await client
    .from("users")
    .select("role:roles(nombre)")
    .eq("id", req.user.id)
    .maybeSingle();

  if (error) throw new ApiError(500, error.message);
  if (data?.role?.nombre !== "admin") {
    throw new ApiError(403, "Esta acción requiere rol de administrador");
  }

  next();
});
