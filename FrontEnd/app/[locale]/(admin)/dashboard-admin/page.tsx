import { setRequestLocale } from 'next-intl/server';
import { Administrador } from "@/components/comp-administrador/administrador";
import { getAdminProjects, getPendingUsers } from "@/lib/api/admin";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [usersResult, projectsResult] = await Promise.all([
    getPendingUsers(),
    getAdminProjects(),
  ]);

  return (
    <Administrador
      initialPendingUsers={usersResult.ok ? usersResult.data.users : []}
      initialProjects={projectsResult.ok ? projectsResult.data.projects : []}
    />
  );
}
