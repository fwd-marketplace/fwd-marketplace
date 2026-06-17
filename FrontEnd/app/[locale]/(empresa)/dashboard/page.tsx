import { setRequestLocale } from "next-intl/server";
import { MisProyectos } from "@/components/comp-perfil-empresa/MisProyectos";
import { getCatalogs, getMyProjects } from "@/lib/api/marketplace";
import { MOCK_AREAS, MOCK_PROJECTS, MOCK_SKILLS } from "@/lib/mock-data";

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
    <main className="min-h-[100dvh] bg-canvas px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <MisProyectos
          initialProjects={projectsResult.ok ? projectsResult.data.projects : MOCK_PROJECTS}
          areas={catalogsResult.ok ? catalogsResult.data.areas : MOCK_AREAS}
          skills={catalogsResult.ok ? catalogsResult.data.skills : MOCK_SKILLS}
        />
      </div>
    </main>
  );
}
