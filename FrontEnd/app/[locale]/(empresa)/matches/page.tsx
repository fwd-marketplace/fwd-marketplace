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
      <main className="min-h-[100dvh] bg-canvas px-4 py-8 md:px-6">
        <div className="mx-auto max-w-7xl">
          <MatchesEmpresa />
        </div>
      </main>
    </>
  );
}
