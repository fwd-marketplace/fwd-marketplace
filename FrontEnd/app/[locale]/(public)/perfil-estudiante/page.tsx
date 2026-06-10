import { setRequestLocale } from "next-intl/server";
import PerfilUsuario from "@/components/comp-perfil-estudiante/PerfilUsuario";
import {
  MOCK_PROFILE,
  MOCK_ACTIVITIES,
  MOCK_APPLICATIONS,
  MOCK_STATS,
} from "@/app/[locale]/(public)/perfil-estudiante/mock-data";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function EstudianteProfile({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PerfilUsuario
      initialProfile={MOCK_PROFILE}
      initialActivities={MOCK_ACTIVITIES}
      initialApplications={MOCK_APPLICATIONS}
      stats={MOCK_STATS}
    />
  );
}
