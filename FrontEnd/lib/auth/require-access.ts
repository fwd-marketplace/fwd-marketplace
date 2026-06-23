import { redirect } from "next/navigation";
import { getMe } from "@/lib/api/profile";
import type { ApiMeProfile, ApiRoleName } from "@/lib/api/types";

/**
 * Guarda de acceso para las áreas protegidas (junior, empresa, admin). Redirige
 * del lado del servidor según el estado de la cuenta:
 *  - sin sesión / sin perfil (onboarding incompleto) -> login
 *  - rol no permitido en esta área -> home
 *  - cuenta NO aprobada por el admin (`estado_cuenta` != 'activa') -> pantalla de
 *    revisión (`/done`): no se permite el acceso hasta que el admin la apruebe
 *
 * Si pasa todas las comprobaciones, devuelve el perfil (cuenta activa y rol permitido)
 * para que el layout lo reutilice sin volver a pedirlo.
 */
export async function requireActiveAccount(
  locale: string,
  allowedRoles: readonly ApiRoleName[],
): Promise<ApiMeProfile> {
  const meResult = await getMe();
  const profile = meResult.ok ? meResult.data.profile : null;

  if (!profile) redirect(`/${locale}/login`);
  if (!allowedRoles.includes(profile.role.nombre)) redirect(`/${locale}/home`);
  if (profile.estado_cuenta !== "activa") redirect(`/${locale}/done`);

  return profile;
}
