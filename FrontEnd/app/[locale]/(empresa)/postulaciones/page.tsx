import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

/**
 * La revisión de postulaciones se consolidó en `/gestion` (sección "Proceso" por proyecto, más
 * completa). Esta ruta se conserva solo para redirigir enlaces antiguos que apuntaban acá.
 */
export default async function PostulacionesPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/gestion`);
}
