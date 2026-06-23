import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { requireActiveAccount } from "@/lib/auth/require-access";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Solo administradores con cuenta activa acceden al panel.
  const profile = await requireActiveAccount(locale, ["admin"]);
  const userName = `${profile.nombre}${profile.apellido1 ? ` ${profile.apellido1}` : ""}`;

  return (
    <div className="flex min-h-[100dvh] bg-canvas">
      <AdminSidebar userName={userName} email={profile.correo} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
