import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/api-client";

/**
 * Indica si hay una sesion iniciada leyendo la cookie de sesion (httpOnly).
 * Solo se puede usar desde el servidor (Server Components o server actions).
 */
export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return Boolean(jar.get(SESSION_COOKIE)?.value);
}
