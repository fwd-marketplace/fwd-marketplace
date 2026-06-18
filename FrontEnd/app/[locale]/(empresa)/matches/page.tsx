import { setRequestLocale } from "next-intl/server";
import { MatchesEmpresa } from "@/components/comp-perfil-empresa/MatchesEmpresa";
import { EmpresaSubnav } from "@/components/layout/empresa-subnav";
import { EmpresaHeroBanner } from "@/components/layout/empresa-hero-banner";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function MatchesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <EmpresaHeroBanner />
      <EmpresaSubnav />
      <main className="min-h-[100dvh] bg-canvas py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <MatchesEmpresa />
        </div>
      </main>
    </>
  );
}
