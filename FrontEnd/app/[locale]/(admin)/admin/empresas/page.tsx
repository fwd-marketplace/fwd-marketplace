import { setRequestLocale } from "next-intl/server";
import { EmpresasView } from "@/components/comp-administrador/EmpresasView";
import { getAllCompanies } from "@/lib/api/admin";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminEmpresasPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const result = await getAllCompanies();
  const companies = result.ok ? result.data.companies : [];
  return <EmpresasView companies={companies} locale={locale} />;
}
