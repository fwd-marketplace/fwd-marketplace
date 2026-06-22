import { setRequestLocale } from "next-intl/server";
import { ModeracionView } from "@/components/comp-administrador/ModeracionView";
import { getReportes } from "@/lib/api/admin";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminModeracionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const result = await getReportes();
  return <ModeracionView initialReportes={result.ok ? result.data.reportes : []} />;
}
