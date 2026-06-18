import { setRequestLocale } from "next-intl/server";
import { MisProyectos } from "@/components/comp-perfil-empresa/MisProyectos";
import { getCatalogs, getMyProjects } from "@/lib/api/marketplace";
import { MOCK_AREAS, MOCK_PROJECTS, MOCK_SKILLS } from "@/lib/mock-data";
import { EmpresaSubnav } from "@/components/layout/empresa-subnav";
import { EmpresaHeroBanner } from "@/components/layout/empresa-hero-banner";

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
    <>
      <EmpresaHeroBanner />
      <EmpresaSubnav />
      <main className="min-h-[100dvh] bg-canvas py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <MisProyectos
            initialProjects={projectsResult.ok ? projectsResult.data.projects : MOCK_PROJECTS}
            areas={catalogsResult.ok ? catalogsResult.data.areas : MOCK_AREAS}
            skills={catalogsResult.ok ? catalogsResult.data.skills : MOCK_SKILLS}
          />
        </div>
      </main>
    </>
  );
}
