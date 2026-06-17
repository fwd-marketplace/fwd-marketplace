import { setRequestLocale } from "next-intl/server";
import { ReportesView } from "@/components/comp-administrador/ReportesView";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminReportesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ReportesView />;
}
