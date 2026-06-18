import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getMe } from "@/lib/api/profile";
import { getProjectById } from "@/lib/api/marketplace";
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

  if (!projectResult.ok) notFound();

  const profile = meResult.ok ? meResult.data.profile : null;
  const role = profile?.role.nombre ?? null;

  return <ProjectDetail project={projectResult.data} role={role} />;
}
