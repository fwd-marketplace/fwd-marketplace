import { setRequestLocale } from 'next-intl/server';
import { Administrador } from "@/components/comp-administrador/administrador";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Administrador />;
}
