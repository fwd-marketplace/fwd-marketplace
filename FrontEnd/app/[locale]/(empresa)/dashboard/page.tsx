import { setRequestLocale } from "next-intl/server";
import { MisProyectos } from "@/components/comp-perfil-empresa/MisProyectos";
import { getCatalogs, getMyProjects } from "@/lib/api/marketplace";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function EmpresaDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [projectsResult, catalogsResult] = await Promise.all([
    getMyProjects(),
    getCatalogs(),
  ]);

  return (
    <main className="min-h-screen bg-canvas py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <MisProyectos
            initialProjects={projectsResult.ok ? projectsResult.data.projects : []}
            areas={catalogsResult.ok ? catalogsResult.data.areas : []}
            skills={catalogsResult.ok ? catalogsResult.data.skills : []}
          />
        </div>
    </main>
  );
}
