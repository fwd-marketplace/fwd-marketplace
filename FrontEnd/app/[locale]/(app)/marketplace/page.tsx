import { setRequestLocale } from "next-intl/server";
import MarketPlaceComponent from "@/components/marketplace/MarketPlace";
import { getCatalogs, getMyOffers, getProjects, getSavedProjectIds } from "@/lib/api/marketplace";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function MarketplacePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [projectsResult, catalogsResult, offersResult, savedIdsResult] = await Promise.all([
    getProjects(),
    getCatalogs(),
    getMyOffers(),
    getSavedProjectIds(),
  ]);

  const projects = projectsResult.ok ? projectsResult.data.projects : [];
  const catalogs = catalogsResult.ok
    ? catalogsResult.data
    : { areas: [], skills: [], projectStates: [], conocimientos: [] };

  const appliedProjectIds = offersResult.ok
    ? offersResult.data.ofertas.flatMap((o) => (o.proyecto ? [o.proyecto.id] : []))
    : [];

  const initialSavedIds = savedIdsResult.ok ? savedIdsResult.data.ids : [];

  return (
    <MarketPlaceComponent
      initialProjects={projects}
      catalogs={catalogs}
      appliedProjectIds={appliedProjectIds}
      initialSavedIds={initialSavedIds}
    />
  );
}
