import { AppHeader } from "@/components/layout/app-header";
import { getMe } from "@/lib/api/profile";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const meResult = await getMe();
  const profile = meResult.ok ? meResult.data.profile : null;
  const userName = profile ? `${profile.nombre}${profile.apellido1 ? ` ${profile.apellido1}` : ''}` : '';
  const avatarUrl = profile?.estudiante?.url_avatar ?? '';
  const role = profile?.role.nombre ?? "student";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <AppHeader userName={userName} avatarUrl={avatarUrl} role={role} tone="student" />
      <main className="flex-1">{children}</main>
    </div>
  );
}
