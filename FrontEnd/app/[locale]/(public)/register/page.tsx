import { setRequestLocale, getTranslations } from "next-intl/server";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { HeroJourneyBadge } from "@/components/ui/HeroJourneyBadge";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("hero_journey");
  return (
    <>
      <HeroJourneyBadge stage="llamado" label={t("llamado_label")} cta={t("llamado_cta")} />
      <RegisterForm />
    </>
  );
}
