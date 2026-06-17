import { setRequestLocale } from "next-intl/server";
import { EgresadosView } from "@/components/comp-administrador/EgresadosView";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminTalentoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <EgresadosView />;
}
