import { setRequestLocale } from "next-intl/server";
import { GestionUsuariosView } from "@/components/comp-administrador/GestionUsuariosView";
import { getAllUsers } from "@/lib/api/admin";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminUsuariosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const result = await getAllUsers();
  const users = result.ok ? result.data.users : [];
  return <GestionUsuariosView users={users} />;
}
