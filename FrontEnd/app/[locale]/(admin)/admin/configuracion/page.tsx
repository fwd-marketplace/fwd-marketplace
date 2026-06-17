import { setRequestLocale } from "next-intl/server";
import { ConfiguracionView } from "@/components/comp-administrador/ConfiguracionView";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminConfiguracionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ConfiguracionView />;
}
