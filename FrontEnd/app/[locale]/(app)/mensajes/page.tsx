import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { Mensajes } from "@/components/mensajes/Mensajes";
import { MOCK_THREADS } from "@/lib/mock-data";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function MensajesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense>
      <Mensajes threads={MOCK_THREADS} />
    </Suspense>
  );
}
