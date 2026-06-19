import { setRequestLocale } from "next-intl/server";
import { getMe } from "@/lib/api/profile";
import { PreferenciasNotificaciones } from "@/components/notificaciones/PreferenciasNotificaciones";
import type { ApiRoleName } from "@/lib/api/types";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function PreferenciasNotificacionesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const meResult = await getMe();
  const role: ApiRoleName =
    meResult.ok ? (meResult.data.profile?.role.nombre ?? "student") : "student";

  return <PreferenciasNotificaciones role={role} />;
}
