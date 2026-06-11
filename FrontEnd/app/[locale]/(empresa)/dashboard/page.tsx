import { setRequestLocale } from "next-intl/server";
import { PerfilEmpresa } from "@/components/comp-perfil-empresa/PerfilEmpresa";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function EmpresaDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-[100dvh] bg-canvas px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <PerfilEmpresa />
      </div>
    </main>
  );
}
