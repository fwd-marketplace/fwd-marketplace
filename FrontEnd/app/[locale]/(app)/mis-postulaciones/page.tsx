import { setRequestLocale } from "next-intl/server";
import { getMyEntregables, getMyOffers } from "@/lib/api/marketplace";
import { MisPostulaciones } from "@/components/marketplace/MisPostulaciones";
import { MOCK_OFFERS } from "@/lib/mock-data";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function MisPostulacionesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [offersResult, entregablesResult] = await Promise.all([
    getMyOffers(),
    getMyEntregables(),
  ]);

  return (
    <MisPostulaciones
      ofertas={offersResult.ok ? offersResult.data.ofertas : MOCK_OFFERS}
      entregables={entregablesResult.ok ? entregablesResult.data.entregables : []}
    />
  );
}
