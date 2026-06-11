import type { User } from "@supabase/supabase-js";

/**
 * Amplía el tipo Request de Express para incluir el usuario de Supabase
 * que inyecta el middleware de autenticación tras validar el token.
 */
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
