import { setRequestLocale } from "next-intl/server";
import { MatchesEmpresa } from "@/components/comp-perfil-empresa/MatchesEmpresa";
import { EmpresaSubnav } from "@/components/layout/empresa-subnav";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function MatchesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <EmpresaSubnav />
      <main className="min-h-screen bg-canvas py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <MatchesEmpresa />
        </div>
      </main>
    </>
  );
}
