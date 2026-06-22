import { setRequestLocale } from "next-intl/server";
import { MatchesEmpresa } from "@/components/comp-perfil-empresa/MatchesEmpresa";
import { EmpresaSubnav } from "@/components/layout/empresa-subnav";
import { searchStudents } from "@/lib/api/students";
import { getCatalogs } from "@/lib/api/marketplace";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function MatchesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [studentsResult, catalogsResult] = await Promise.all([searchStudents(), getCatalogs()]);
  const initialStudents = studentsResult.ok ? studentsResult.data.students : [];
  const skills = catalogsResult.ok
    ? catalogsResult.data.skills.map((s) => ({ id: s.id, nombre: s.nombre }))
    : [];

  return (
    <>
      <EmpresaSubnav />
      <main className="min-h-screen bg-canvas py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <MatchesEmpresa initialStudents={initialStudents} skills={skills} />
        </div>
      </main>
    </>
  );
}
