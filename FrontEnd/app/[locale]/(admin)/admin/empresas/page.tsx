import { setRequestLocale } from "next-intl/server";
import { EmpresasView } from "@/components/comp-administrador/EmpresasView";
import { getAdminProjects, getPendingUsers } from "@/lib/api/admin";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminEmpresasPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [projectsResult, usersResult] = await Promise.all([getAdminProjects(), getPendingUsers()]);
  const projects = projectsResult.ok ? projectsResult.data.projects : [];
  const pendingCompanies = usersResult.ok
    ? usersResult.data.users.filter((user) => user.role?.nombre === "company")
    : [];
  return <EmpresasView projects={projects} pendingCompanies={pendingCompanies} />;
}
