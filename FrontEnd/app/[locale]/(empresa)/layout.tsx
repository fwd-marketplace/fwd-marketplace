import { AppHeader } from "@/components/layout/app-header";
import { EmpresaSubnav } from "@/components/layout/empresa-subnav";

export default function EmpresaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <AppHeader />
      <EmpresaSubnav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
