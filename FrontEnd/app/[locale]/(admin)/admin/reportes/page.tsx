import { setRequestLocale } from "next-intl/server";
import { ReportesView } from "@/components/comp-administrador/ReportesView";
import { getAdminProjects, getAdminStudents, getAllCompanies, getAllUsers } from "@/lib/api/admin";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminReportesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [projectsResult, usersResult, studentsResult, companiesResult] = await Promise.all([
    getAdminProjects(),
    getAllUsers(),
    getAdminStudents(),
    getAllCompanies(),
  ]);
  return (
    <ReportesView
      projects={projectsResult.ok ? projectsResult.data.projects : []}
      users={usersResult.ok ? usersResult.data.users : []}
      students={studentsResult.ok ? studentsResult.data.students : []}
      companies={companiesResult.ok ? companiesResult.data.companies : []}
    />
  );
}
