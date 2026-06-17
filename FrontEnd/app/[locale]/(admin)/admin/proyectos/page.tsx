import { setRequestLocale } from "next-intl/server";
import { ProyectosView } from "@/components/comp-administrador/ProyectosView";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminProyectosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ProyectosView />;
}
