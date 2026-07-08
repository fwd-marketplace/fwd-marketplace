import { setRequestLocale } from "next-intl/server";
import { JuniorDone } from "@/components/onboarding/junior/JuniorDone";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function JuniorDonePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { status } = await searchParams;
  setRequestLocale(locale);
  return <JuniorDone locale={locale} approved={status === "approved"} />;
}
