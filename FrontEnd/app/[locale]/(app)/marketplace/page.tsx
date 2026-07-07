import { setRequestLocale } from "next-intl/server";
import MarketPlaceComponent from "@/components/marketplace/MarketPlace";
import { getCatalogs, getMyOffers, getProjects, getSavedProjectIds } from "@/lib/api/marketplace";
import { getMe } from "@/lib/api/profile";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function MarketplacePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [projectsResult, catalogsResult, offersResult, savedIdsResult, meResult] = await Promise.all([
    getProjects(),
    getCatalogs(),
    getMyOffers(),
    getSavedProjectIds(),
    getMe(),
  ]);

  const projects = projectsResult.ok ? projectsResult.data.projects : [];
  const catalogs = catalogsResult.ok
    ? catalogsResult.data
    : { areas: [], skills: [], projectStates: [], conocimientos: [] };

  const appliedProjectIds = offersResult.ok
    ? offersResult.data.ofertas.flatMap((o) => (o.proyecto ? [o.proyecto.id] : []))
    : [];

  const initialSavedIds = savedIdsResult.ok ? savedIdsResult.data.ids : [];

  const studentProfile = meResult.ok ? meResult.data.profile?.estudiante : null;
  const studentSkills = studentProfile?.skills ?? [];
  const studentDisponible = studentProfile?.disponible ?? true;
  const studentReputacion = studentProfile?.reputacion ?? null;

  return (
    <MarketPlaceComponent
      initialProjects={projects}
      catalogs={catalogs}
      appliedProjectIds={appliedProjectIds}
      initialSavedIds={initialSavedIds}
      studentSkills={studentSkills}
      studentDisponible={studentDisponible}
      studentReputacion={studentReputacion}
    />
  );
}
