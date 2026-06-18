import { setRequestLocale } from "next-intl/server";
import { PostulacionesEmpresa } from "@/components/comp-perfil-empresa/PostulacionesEmpresa";
import { getMyProjects } from "@/lib/api/marketplace";
import { EmpresaSubnav } from "@/components/layout/empresa-subnav";
import { EmpresaHeroBanner } from "@/components/layout/empresa-hero-banner";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function PostulacionesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const projectsResult = await getMyProjects();

  return (
    <>
      <EmpresaHeroBanner />
      <EmpresaSubnav />
      <main className="min-h-[100dvh] bg-canvas py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <PostulacionesEmpresa initialProjects={projectsResult.ok ? projectsResult.data.projects : []} />
        </div>
      </main>
    </>
  );
}
