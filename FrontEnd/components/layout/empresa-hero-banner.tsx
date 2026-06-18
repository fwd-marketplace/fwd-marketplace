import { getTranslations } from 'next-intl/server';
import { Building2, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FwdGeoBackdrop } from '@/components/ui/fwd-geo-backdrop';
import { getMe } from '@/lib/api/profile';

function parseLocation(direccion: string | null): { provincia: string; canton: string } {
  if (!direccion) return { provincia: '', canton: '' };
  try {
    const parsed = JSON.parse(direccion) as { provincia?: string; canton?: string };
    return {
      provincia: parsed.provincia ?? '',
      canton: parsed.canton ?? '',
    };
  } catch {
    return { provincia: '', canton: '' };
  }
}

export async function EmpresaHeroBanner() {
  const t = await getTranslations('mi_empresa');
  const meResult = await getMe();
  const emp = meResult.ok ? meResult.data.profile?.empresario : null;
  const tipo = emp?.tipo ?? 'empresa';
  const { provincia, canton } = parseLocation(emp?.direccion ?? null);

  return (
    <div className="relative overflow-hidden bg-secondary px-6 pb-16 pt-10">
      <FwdGeoBackdrop />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 md:flex-row md:items-center md:px-6">
        {/* Logo */}
        <div className="shrink-0">
          <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-secondary-foreground/10 shadow-[var(--shadow-elevated)]">
            {emp?.url_logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={emp.url_logo} alt={t('logo.alt')} className="size-full object-cover" />
            ) : (
              <Building2 className="size-14 text-highlight" />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="space-y-1">
            <Badge className="border-none bg-highlight font-bold text-secondary">
              {t(`badge.${tipo}`).toUpperCase()}
            </Badge>
            <h2 className="font-heading text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              {emp?.nombre_comercial ?? (
                <span className="opacity-40">{t('placeholders.company_name')}</span>
              )}
              <span className="text-primary">.</span>
            </h2>
          </div>
          {emp?.descripcion && (
            <p className="max-w-2xl text-lg leading-relaxed text-white/80">{emp.descripcion}</p>
          )}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60 md:justify-start">
            {(canton || provincia) && (
              <span className="flex items-center gap-1">
                <MapPin className="size-4" />
                {canton}{canton && provincia ? ', ' : ''}{provincia}{provincia ? ', Costa Rica' : ''}
              </span>
            )}
            {tipo === 'empresa' && emp?.cantidad_empleados && (
              <span className="flex items-center gap-1">
                <Users className="size-4" />
                {emp.cantidad_empleados} {t('fields.employees_unit')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
