import { AppHeader } from '@/components/layout/app-header';
import { TerminosYCondiciones } from '@/components/Terminos-y-condiciones/terminos-y-condiciones';
import { getMe } from '@/lib/api/profile';

export default async function TerminosPage() {
  const meResult = await getMe();
  const profile = meResult.ok ? meResult.data.profile : null;
  const userName = profile ? `${profile.nombre}${profile.apellido1 ? ` ${profile.apellido1}` : ''}` : '';
  const avatarUrl = profile?.estudiante?.url_avatar ?? profile?.empresario?.url_logo ?? '';
  const role = profile?.role.nombre;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      {profile && <AppHeader userName={userName} avatarUrl={avatarUrl} tone="public" {...(role ? { role } : {})} />}
      <main className="flex-1">
        <TerminosYCondiciones showBack={!profile} />
      </main>
    </div>
  );
}
