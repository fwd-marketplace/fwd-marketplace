import { setRequestLocale } from "next-intl/server";
import { getMe } from "@/lib/api/profile";
import { GestionPage } from "@/components/gestion/GestionPage";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function GestionRoute({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const meResult = await getMe();
  const profile  = meResult.ok ? meResult.data.profile : null;
  const role     = profile?.role.nombre ?? null;

  return <GestionPage role={role} />;
}
