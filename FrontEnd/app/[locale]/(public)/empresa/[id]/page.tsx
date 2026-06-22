import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getPublicEmpresaProfile, getPublicEmpresaProjects } from "@/lib/api/profile";
import { PublicEmpresaProfile } from "@/components/public/PublicEmpresaProfile";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function PublicEmpresaPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "public_empresa_profile" });

  const [profileResult, projectsResult] = await Promise.all([
    getPublicEmpresaProfile(id),
    getPublicEmpresaProjects(id),
  ]);

  if (!profileResult.ok) {
    return (
      <main className="min-h-screen bg-canvas py-16 px-4 text-center">
        <p className="text-ink-muted text-sm">{t("not_found")}</p>
      </main>
    );
  }

  const projects = projectsResult.ok ? projectsResult.data : [];

  return (
    <PublicEmpresaProfile
      perfil={profileResult.data}
      projects={projects}
      locale={locale}
      backLabel={t("back_to_marketplace")}
      backHref={`/${locale}/marketplace`}
    />
  );
}
