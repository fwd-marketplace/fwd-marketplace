import { setRequestLocale } from "next-intl/server";
import { CompanyProfile } from "@/components/comp-mi-empresa/mi-empresa";
import { getMe } from "@/lib/api/profile";
import { getCatalogs } from "@/lib/api/marketplace";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function EmpresaProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [meResult, catalogsResult] = await Promise.all([getMe(), getCatalogs()]);

  const profile = meResult.ok ? meResult.data.profile : null;
  const tipo = profile?.empresario?.tipo ?? 'empresa';
  const areas = catalogsResult.ok ? catalogsResult.data.areas : [];

  return (
    <CompanyProfile
      initialProfile={profile}
      tipo={tipo}
      initialAreas={areas}
    />
  );
}
