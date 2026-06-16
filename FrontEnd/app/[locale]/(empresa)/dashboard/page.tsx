import { setRequestLocale } from "next-intl/server";
import { MisProyectos } from "@/components/comp-perfil-empresa/MisProyectos";
import { getMyProjects } from "@/lib/api/marketplace";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function EmpresaDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const projectsResult = await getMyProjects();

  return (
    <main className="min-h-[100dvh] bg-canvas px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <MisProyectos initialProjects={projectsResult.ok ? projectsResult.data.projects : []} />
      </div>
    </main>
  );
}
