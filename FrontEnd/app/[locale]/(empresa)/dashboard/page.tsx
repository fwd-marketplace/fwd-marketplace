import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

/**
 * La gestión de proyectos de la empresa se consolidó en `/gestion` (un solo hub para empresa y
 * junior). Esta ruta se conserva solo para redirigir enlaces antiguos que apuntaban al dashboard.
 */
export default async function EmpresaDashboardPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/gestion`);
}
