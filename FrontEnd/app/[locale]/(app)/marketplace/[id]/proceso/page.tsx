import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getMe } from "@/lib/api/profile";
import { getProjectById, getMyOffers, getMyEntregables } from "@/lib/api/marketplace";
import { MOCK_MARKETPLACE_BY_ID, MOCK_OFFERS } from "@/lib/mock-data";
import { MOCK_PROCESO_ENTREGABLES, MOCK_PROJECT_OFFERS } from "@/lib/mock-proceso";
import { ProcesoPage } from "@/components/marketplace/ProcesoPage";
import type { ApiRoleName } from "@/lib/api/types";

interface Props {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ demo?: string }>;
}

export default async function ProcesoProjectPage({ params, searchParams }: Props) {
  const { locale, id } = await params;
  const { demo } = await searchParams;
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
  const authRole = profile?.role.nombre ?? null;

  // ?demo=empresa / ?demo=junior override when not authenticated (mock mode only)
  const demoRole: ApiRoleName | null =
    !authRole && demo === "empresa" ? "company"
    : !authRole && demo === "junior" ? "student"
    : null;

  const role = authRole ?? demoRole;

  const offer = offersResult.ok
    ? (offersResult.data.ofertas.find((o) => o.proyecto?.id === id) ?? null)
    : MOCK_OFFERS.find((o) => o.proyecto?.id === id) ?? null;

  const entregables = entregablesResult.ok
    ? entregablesResult.data.entregables.filter((e) => e.id_proyecto === id)
    : MOCK_PROCESO_ENTREGABLES.filter((e) => e.id_proyecto === id);

  const isEmpresaView = role === "company" || demoRole === "company";

  return (
    <ProcesoPage
      project={project}
      role={role}
      offer={offer}
      entregables={entregables}
      {...(isEmpresaView ? { projectOffers: MOCK_PROJECT_OFFERS } : {})}
    />
  );
}
