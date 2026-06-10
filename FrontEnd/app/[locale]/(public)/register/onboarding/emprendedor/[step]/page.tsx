import { setRequestLocale } from "next-intl/server";
import { EmprendedorOnboarding } from "@/components/onboarding/emprendedor/EmprendedorOnboarding";

interface Props {
  params: Promise<{ locale: string; step: string }>;
}

export default async function EmprendedorOnboardingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <EmprendedorOnboarding />;
}
