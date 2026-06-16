import { setRequestLocale } from "next-intl/server";
import { DashboardView } from "@/components/comp-administrador/DashboardView";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DashboardView />;
}
