import { AppHeader } from "@/components/layout/app-header";
import { getMe } from "@/lib/api/profile";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
<<<<<<< HEAD
  const meResult = await getMe();
  const profile = meResult.ok ? meResult.data.profile : null;
  const userName = profile
    ? `${profile.nombre}${profile.apellido1 ? ` ${profile.apellido1}` : ""}`
    : "";
  const avatarUrl = profile?.empresario?.url_logo ?? profile?.estudiante?.url_avatar ?? "";
  const role = profile?.role.nombre;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <AppHeader userName={userName} avatarUrl={avatarUrl} {...(role !== undefined ? { role } : {})} />
      <main className="flex-1">{children}</main>
=======
  return (
    <div className="bg-secondary min-h-screen">
      {children}
>>>>>>> cbc5783a949bfd93bbf5bd117333bf550ed5dcd3
    </div>
  );
}
