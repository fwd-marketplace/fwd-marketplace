import { setRequestLocale } from "next-intl/server";
import { JuniorOnboarding } from "@/components/onboarding/junior/JuniorOnboarding";

interface Props {
  params: Promise<{ locale: string; step: string }>;
}

export default async function JuniorOnboardingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <JuniorOnboarding />;
}
