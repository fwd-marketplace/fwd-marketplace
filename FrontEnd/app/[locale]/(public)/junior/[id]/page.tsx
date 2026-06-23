import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getPublicJuniorProfile, getMe } from "@/lib/api/profile";
import { PublicJuniorProfile } from "@/components/public/PublicJuniorProfile";
import { AppHeader } from "@/components/layout/app-header";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function PublicJuniorPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "public_junior_profile" });

  const [result, meResult] = await Promise.all([
    getPublicJuniorProfile(id),
    getMe(),
  ]);

  if (!result.ok) {
    return (
      <main className="min-h-screen bg-canvas py-16 px-4 text-center">
        <p className="text-ink-muted text-sm">{t("not_found")}</p>
      </main>
    );
  }

  const profile = meResult.ok ? meResult.data.profile : null;
  const userName = profile ? `${profile.nombre}${profile.apellido1 ? ` ${profile.apellido1}` : ""}` : "";
  const avatarUrl = profile?.empresario?.url_logo ?? profile?.estudiante?.url_avatar ?? "";
  const role = profile?.role.nombre;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <AppHeader userName={userName} avatarUrl={avatarUrl} {...(role !== undefined ? { role } : {})} />
      <main className="flex-1">
        <PublicJuniorProfile
          perfil={result.data}
          backHref={`/${locale}/marketplace`}
          backLabel={t("back")}
        />
      </main>
    </div>
  );
}
