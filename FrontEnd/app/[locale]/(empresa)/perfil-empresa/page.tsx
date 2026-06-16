import { setRequestLocale } from "next-intl/server";
import { PerfilEmpresa } from "@/components/comp-perfil-empresa/PerfilEmpresa";
import { getCatalogs, getMyProjects } from "@/lib/api/marketplace";
import { getMe } from "@/lib/api/profile";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function EmpresaProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [meResult, projectsResult, catalogsResult] = await Promise.all([
    getMe(),
    getMyProjects(),
    getCatalogs(),
  ]);

  return (
    <main className="min-h-[100dvh] bg-canvas px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <PerfilEmpresa
          initialProfile={meResult.ok ? meResult.data.profile : null}
          initialProjects={projectsResult.ok ? projectsResult.data.projects : []}
          areas={catalogsResult.ok ? catalogsResult.data.areas : []}
          skills={catalogsResult.ok ? catalogsResult.data.skills : []}
        />
      </div>
    </main>
  );
}
