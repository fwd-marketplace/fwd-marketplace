import { AppHeader } from "@/components/layout/app-header";
import { EmpresaHeroBanner } from "@/components/layout/empresa-hero-banner";
import { EmpresaSubnav } from "@/components/layout/empresa-subnav";
import { requireActiveAccount } from "@/lib/auth/require-access";

export default async function EmpresaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Solo empresas/emprendedores (rol company) con cuenta aprobada entran al área de empresa.
  const profile = await requireActiveAccount(locale, ["company"]);
  const userName = `${profile.nombre}${profile.apellido1 ? ` ${profile.apellido1}` : ""}`;
  const avatarUrl = profile.empresario?.url_logo ?? "";
  const role = profile.role.nombre;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <AppHeader userName={userName} avatarUrl={avatarUrl} role={role} />
      <EmpresaHeroBanner />
      <EmpresaSubnav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
