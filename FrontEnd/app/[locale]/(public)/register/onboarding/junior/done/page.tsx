import { setRequestLocale } from "next-intl/server";
import { JuniorDone } from "@/components/onboarding/junior/JuniorDone";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function JuniorDonePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <JuniorDone locale={locale} />;
}
