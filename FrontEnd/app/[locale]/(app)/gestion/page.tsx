import { setRequestLocale } from "next-intl/server";
import { getMe } from "@/lib/api/profile";
import { getMyOffers } from "@/lib/api/marketplace";
import { GestionPage } from "@/components/gestion/GestionPage";
import type { ApiRoleName, MyOffer } from "@/lib/api/types";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ demo?: string; proyecto?: string }>;
}

export default async function GestionRoute({ params, searchParams }: Props) {
  const { locale } = await params;
  const { demo, proyecto } = await searchParams;
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
  const disponible = profile?.estudiante?.disponible ?? true;

  // Pre-load offers server-side so GestionPage has them immediately (no client fetch needed).
  let initialOffers: MyOffer[] = [];
  if (role === "student" || demoRole === "student") {
    const offersResult = await getMyOffers();
    if (offersResult.ok) initialOffers = offersResult.data.ofertas;
  }

  return (
    <GestionPage
      role={role}
      userId={userId}
      initialProjectId={proyecto ?? null}
      disponible={disponible}
      initialOffers={initialOffers}
    />
  );
}
