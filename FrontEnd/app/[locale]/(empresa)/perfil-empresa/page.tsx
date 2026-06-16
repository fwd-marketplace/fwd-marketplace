import { setRequestLocale } from "next-intl/server";
import { CompanyProfile } from "@/components/comp-mi-empresa/mi-empresa";
import { getMe } from "@/lib/api/profile";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function EmpresaProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const meResult = await getMe();

  const profile = meResult.ok ? meResult.data.profile : null;
  const tipo = profile?.empresario?.tipo ?? 'empresa';

  return (
    <CompanyProfile
      initialProfile={profile}
      tipo={tipo}
    />
  );
}
