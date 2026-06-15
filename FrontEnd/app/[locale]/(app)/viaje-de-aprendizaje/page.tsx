import { setRequestLocale } from "next-intl/server";
import { ViajeDeAprendizaje } from "@/components/viaje-de-aprendizaje/ViajeDeAprendizaje";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ViajeDeAprendizajePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ViajeDeAprendizaje />;
}
