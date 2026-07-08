import { setRequestLocale } from "next-intl/server";
import { SolicitudesView } from "@/components/comp-administrador/SolicitudesView";
import { getPendingUsers } from "@/lib/api/admin";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminSolicitudesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const result = await getPendingUsers();
  return <SolicitudesView initialUsers={result.ok ? result.data.users : []} />;
}
