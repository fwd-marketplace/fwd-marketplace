import { setRequestLocale } from "next-intl/server";
import { EmpresasView } from "@/components/comp-administrador/EmpresasView";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminEmpresasPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <EmpresasView />;
}
