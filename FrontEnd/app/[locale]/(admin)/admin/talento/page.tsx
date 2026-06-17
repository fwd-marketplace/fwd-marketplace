import { setRequestLocale } from "next-intl/server";
import { EgresadosView } from "@/components/comp-administrador/EgresadosView";
import { getAdminStudents } from "@/lib/api/admin";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminTalentoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const result = await getAdminStudents();

  if (!result.ok) {
    return <EgresadosView users={[]} error={result.error} />;
  }

  return <EgresadosView users={result.data.users} />;
}
