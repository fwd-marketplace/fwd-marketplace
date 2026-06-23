import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getPublicJuniorProfile } from "@/lib/api/profile";
import { PublicJuniorProfile } from "@/components/public/PublicJuniorProfile";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function PublicJuniorPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "public_junior_profile" });

  const result = await getPublicJuniorProfile(id);

  if (!result.ok) {
    return (
      <main className="min-h-screen bg-canvas py-16 px-4 text-center">
        <p className="text-ink-muted text-sm">{t("not_found")}</p>
      </main>
    );
  }

  return (
    <PublicJuniorProfile
      perfil={result.data}
      backHref={`/${locale}/marketplace`}
      backLabel={t("back")}
    />
  );
}
