import { setRequestLocale } from "next-intl/server";
import { EmprendedorDone } from "@/components/onboarding/emprendedor/EmprendedorDone";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function EmprendedorDonePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <EmprendedorDone locale={locale} />;
}
