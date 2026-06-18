import { setRequestLocale } from "next-intl/server";
import { Ranking } from "@/components/ranking/Ranking";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function RankingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Ranking />;
}
