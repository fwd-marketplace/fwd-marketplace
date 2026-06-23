import { AppHeader } from "@/components/layout/app-header";
import { requireActiveAccount } from "@/lib/auth/require-access";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Junior, empresa y admin con cuenta aprobada. La empresa entra a /gestion (incluida en
  // este grupo) para ver las postulaciones y chatear con los estudiantes; el admin accede a
  // la bienvenida desde el botón "Página principal" del panel.
  const profile = await requireActiveAccount(locale, ["student", "company", "admin"]);
  const userName = `${profile.nombre}${profile.apellido1 ? ` ${profile.apellido1}` : ""}`;
  const avatarUrl = profile.estudiante?.url_avatar ?? "";
  const role = profile.role.nombre;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <AppHeader userName={userName} avatarUrl={avatarUrl} role={role} tone="student" />
      <main className="flex-1">{children}</main>
    </div>
  );
}
