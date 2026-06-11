import { setRequestLocale } from "next-intl/server";
import { EmpresaDone } from "@/components/onboarding/empresa/EmpresaDone";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function EmpresaDonePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <EmpresaDone locale={locale} />;
}
