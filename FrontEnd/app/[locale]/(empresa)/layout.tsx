import { AppHeader } from "@/components/layout/app-header";
import { EmpresaHeroBanner } from "@/components/layout/empresa-hero-banner";
import { EmpresaSubnav } from "@/components/layout/empresa-subnav";
import { getMe } from "@/lib/api/profile";

export default async function EmpresaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const meResult = await getMe();
  const profile = meResult.ok ? meResult.data.profile : null;
  const userName = profile ? `${profile.nombre}${profile.apellido1 ? ` ${profile.apellido1}` : ''}` : '';
  const avatarUrl = profile?.empresario?.url_logo ?? '';
  const role = profile?.role.nombre ?? "company";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <AppHeader userName={userName} avatarUrl={avatarUrl} role={role} />
      <EmpresaHeroBanner />
      <EmpresaSubnav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
