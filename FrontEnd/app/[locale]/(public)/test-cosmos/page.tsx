import CosmosProfesional from '@/components/home/CosmosProfesional';
import { setRequestLocale } from 'next-intl/server';

export default async function TestCosmosPage({ params }: { params: Promise<{ locale: string }> }) {
  // Configurar el locale para Server Components si es necesario
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen w-full bg-secondary">
      <CosmosProfesional />
    </main>
  );
}
