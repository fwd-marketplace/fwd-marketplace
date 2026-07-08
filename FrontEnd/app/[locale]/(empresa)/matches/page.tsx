import { setRequestLocale } from "next-intl/server";
import { MatchesEmpresa } from "@/components/comp-perfil-empresa/MatchesEmpresa";
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

  // El subnav y el <main> los provee (empresa)/layout.tsx; acá solo el contenido.
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <MatchesEmpresa initialStudents={initialStudents} skills={skills} />
    </div>
  );
}
