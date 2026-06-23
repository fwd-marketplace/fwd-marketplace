import { setRequestLocale } from "next-intl/server";
import { DashboardView } from "@/components/comp-administrador/DashboardView";
import { getPendingUsers, getAdminProjects, getAdminStudents } from "@/lib/api/admin";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [usersResult, projectsResult, studentsResult] = await Promise.all([
    getPendingUsers(),
    getAdminProjects(),
    getAdminStudents(),
  ]);
  const students = studentsResult.ok ? studentsResult.data.students : [];
  const pendingStudents = students.filter((student) => student.estado_verificacion === "pendiente");
  return (
    <DashboardView
      pendingUsers={usersResult.ok ? usersResult.data.users : []}
      projects={projectsResult.ok ? projectsResult.data.projects : []}
      pendingStudents={pendingStudents}
    />
  );
}
