import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getMe } from "@/lib/api/profile";
import { getProjectById } from "@/lib/api/marketplace";
import { MOCK_MARKETPLACE_BY_ID } from "@/lib/mock-data";
import { ProjectDetail } from "@/components/marketplace/ProjectDetail";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [meResult, projectResult] = await Promise.all([
    getMe(),
    getProjectById(id),
  ]);

  const project = projectResult.ok
    ? projectResult.data
    : MOCK_MARKETPLACE_BY_ID.get(id) ?? null;

  if (!project) notFound();

  const profile = meResult.ok ? meResult.data.profile : null;
  const role = profile?.role.nombre ?? null;

  return <ProjectDetail project={project} role={role} />;
}
