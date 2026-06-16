import { setRequestLocale } from "next-intl/server";
import { SolicitudesView } from "@/components/comp-administrador/SolicitudesView";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminSolicitudesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SolicitudesView />;
}
