import { setRequestLocale } from "next-intl/server";
import { MatchesEmpresa } from "@/components/comp-perfil-empresa/MatchesEmpresa";
import { getMyProjects } from "@/lib/api/marketplace";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function MatchesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const projectsResult = await getMyProjects();
  const realProjects = projectsResult.ok
    ? projectsResult.data.projects
        .filter((p) => p.estado.nombre !== "cancelado" && p.estado.nombre !== "cerrado")
        .map((p) => ({ id: p.id, titulo: p.titulo }))
    : [];

  return (
    <main className="min-h-screen bg-canvas py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <MatchesEmpresa realProjects={realProjects} />
        </div>
    </main>
  );
}
