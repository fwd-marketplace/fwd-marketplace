import { setRequestLocale } from "next-intl/server";
import { ProyectosView } from "@/components/comp-administrador/ProyectosView";
import { getAdminProjects } from "@/lib/api/admin";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminProyectosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const result = await getAdminProjects();
  return <ProyectosView initialProjects={result.ok ? result.data.projects : []} />;
}
