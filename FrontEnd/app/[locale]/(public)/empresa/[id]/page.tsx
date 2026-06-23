import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getPublicEmpresaProfile, getPublicEmpresaProjects, getMe } from "@/lib/api/profile";
import { PublicEmpresaProfile } from "@/components/public/PublicEmpresaProfile";
import { AppHeader } from "@/components/layout/app-header";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function PublicEmpresaPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "public_empresa_profile" });

  const [profileResult, projectsResult, meResult] = await Promise.all([
    getPublicEmpresaProfile(id),
    getPublicEmpresaProjects(id),
    getMe(),
  ]);

  if (!profileResult.ok) {
    return (
      <main className="min-h-screen bg-canvas py-16 px-4 text-center">
        <p className="text-ink-muted text-sm">{t("not_found")}</p>
      </main>
    );
  }

  const projects = projectsResult.ok ? projectsResult.data : [];
  const profile = meResult.ok ? meResult.data.profile : null;
  const userName = profile ? `${profile.nombre}${profile.apellido1 ? ` ${profile.apellido1}` : ""}` : "";
  const avatarUrl = profile?.empresario?.url_logo ?? profile?.estudiante?.url_avatar ?? "";
  const role = profile?.role.nombre;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <AppHeader userName={userName} avatarUrl={avatarUrl} {...(role !== undefined ? { role } : {})} />
      <main className="flex-1">
        <PublicEmpresaProfile
          perfil={profileResult.data}
          projects={projects}
          locale={locale}
          backLabel={t("back_to_marketplace")}
          backHref={`/${locale}/marketplace`}
        />
      </main>
    </div>
  );
}
