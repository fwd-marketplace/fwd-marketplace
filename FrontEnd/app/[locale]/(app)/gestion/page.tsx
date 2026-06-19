import { setRequestLocale } from "next-intl/server";
import { getMe } from "@/lib/api/profile";
import { GestionPage } from "@/components/gestion/GestionPage";
import type { ApiRoleName } from "@/lib/api/types";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ demo?: string }>;
}

export default async function GestionRoute({ params, searchParams }: Props) {
  const { locale } = await params;
  const { demo }   = await searchParams;
  setRequestLocale(locale);

  const meResult = await getMe();
  const profile  = meResult.ok ? meResult.data.profile : null;
  const authRole = profile?.role.nombre ?? null;

  const demoRole: ApiRoleName | null =
    demo === "empresa" ? "company"
    : demo === "junior" ? "student"
    : null;

  const role   = demoRole ?? authRole;
  const userId = profile?.id ?? null;

  return <GestionPage role={role} userId={userId} />;
}
