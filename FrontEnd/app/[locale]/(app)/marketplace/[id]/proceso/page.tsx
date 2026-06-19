import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getMe } from "@/lib/api/profile";
import { getProjectById, getMyOffers, getMyEntregables } from "@/lib/api/marketplace";
import { MOCK_MARKETPLACE_BY_ID } from "@/lib/mock-data";
import { ProcesoPage } from "@/components/marketplace/ProcesoPage";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ProcesoProjectPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [meResult, projectResult, offersResult, entregablesResult] = await Promise.all([
    getMe(),
    getProjectById(id),
    getMyOffers(),
    getMyEntregables(),
  ]);

  const project = projectResult.ok
    ? projectResult.data
    : MOCK_MARKETPLACE_BY_ID.get(id) ?? null;

  if (!project) notFound();

  const profile = meResult.ok ? meResult.data.profile : null;
  const role = profile?.role.nombre ?? null;

  const offer = offersResult.ok
    ? (offersResult.data.ofertas.find((o) => o.proyecto?.id === id) ?? null)
    : null;

  const entregables = entregablesResult.ok
    ? entregablesResult.data.entregables.filter((e) => e.id_proyecto === id)
    : [];

  return (
    <ProcesoPage
      project={project}
      role={role}
      offer={offer}
      entregables={entregables}
    />
  );
}
