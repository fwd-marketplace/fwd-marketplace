import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { Mensajes } from "@/components/mensajes/Mensajes";
import { getMyOffers } from "@/lib/api/marketplace";
import { apiAuth } from "@/lib/api-client";

interface Props {
  params: Promise<{ locale: string }>;
}

type PerfilMe = { id: string };

export default async function MensajesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [offersResult, perfil] = await Promise.all([
    getMyOffers(),
    apiAuth<PerfilMe>("/perfil").catch(() => null),
  ]);

  const offers = offersResult.ok ? offersResult.data.ofertas : [];
  const currentUserId = perfil?.id ?? "";

  return (
    <Suspense>
      <Mensajes initialOffers={offers} currentUserId={currentUserId} />
    </Suspense>
  );
}
