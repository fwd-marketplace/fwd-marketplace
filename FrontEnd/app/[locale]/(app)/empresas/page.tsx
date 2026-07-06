import { setRequestLocale } from "next-intl/server";
import { getPublicEmpresas } from "@/lib/api/profile";
import { EmpresasDirectorio } from "@/components/empresas/EmpresasDirectorio";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function EmpresasPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const result = await getPublicEmpresas();
  const empresas = result.ok ? result.data : [];

  return (
    <main className="min-h-screen bg-canvas py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <EmpresasDirectorio empresas={empresas} />
      </div>
    </main>
  );
}
