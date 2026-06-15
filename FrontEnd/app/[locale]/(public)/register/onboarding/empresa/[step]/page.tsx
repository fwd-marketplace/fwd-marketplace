import { setRequestLocale } from "next-intl/server";
import { EmpresaOnboarding } from "@/components/onboarding/empresa/EmpresaOnboarding";

interface Props {
  params: Promise<{ locale: string; step: string }>;
}

export default async function EmpresaOnboardingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <EmpresaOnboarding />;
}
