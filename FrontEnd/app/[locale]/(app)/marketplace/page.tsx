import { setRequestLocale } from "next-intl/server";
import MarketPlaceComponent from "@/components/marketplace/MarketPlace";
import { getCatalogs, getMyOffers, getProjects } from "@/lib/api/marketplace";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function MarketplacePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [projectsResult, catalogsResult, offersResult] = await Promise.all([
    getProjects(),
    getCatalogs(),
    getMyOffers(),
  ]);

  const projects = projectsResult.ok ? projectsResult.data.projects : [];
  const catalogs = catalogsResult.ok
    ? catalogsResult.data
    : { areas: [], skills: [], projectStates: [] };

  const appliedProjectIds = offersResult.ok
    ? offersResult.data.ofertas.flatMap((o) => (o.proyecto ? [o.proyecto.id] : []))
    : [];

  return (
    <MarketPlaceComponent
      initialProjects={projects}
      catalogs={catalogs}
      appliedProjectIds={appliedProjectIds}
    />
  );
}
