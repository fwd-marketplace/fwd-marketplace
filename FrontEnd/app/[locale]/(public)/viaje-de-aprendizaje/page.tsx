import { setRequestLocale } from "next-intl/server";
import { ViajeDeAprendizaje } from "@/components/viaje-de-aprendizaje/ViajeDeAprendizaje";
import { getMe } from "@/lib/api/profile";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ViajeDeAprendizajePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const meResult = await getMe();
  const profile = meResult.ok ? meResult.data.profile : null;

  const userName = profile
    ? `${profile.nombre}${profile.apellido1 ? ` ${profile.apellido1}` : ""}`
    : undefined;

  return (
    <ViajeDeAprendizaje
      userName={userName}
      avatarUrl={profile?.estudiante?.url_avatar ?? undefined}
      role={profile?.role.nombre}
    />
  );
}
