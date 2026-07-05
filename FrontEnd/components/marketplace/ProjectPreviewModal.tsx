'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { X, Building2, Zap, Clock, ExternalLink, Wallet } from 'lucide-react';
import { formatCompensacion } from '@/lib/marketplace/compensation';
import type { ApiProject } from '@/lib/api/types';

interface Props {
  project: ApiProject;
  onClose: () => void;
}

export function ProjectPreviewModal({ project, onClose }: Props) {
  const t = useTranslations('project_preview_modal');
  const locale = useLocale();
  const router = useRouter();

  const skills = project.skills.flatMap((s) => (s.skill ? [s.skill] : []));

  function handleGoToGestion() {
    onClose();
    router.push(`/${locale}/gestion?proyecto=${project.id}`);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={project.titulo}
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-ink-strong/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t('close')}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg bg-surface rounded-2xl border border-border shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-6 pb-4">
          <div className="flex-1 min-w-0">
            {project.area && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                {project.area.nombre}
              </p>
            )}
            <h2 className="font-heading text-2xl font-bold text-ink-strong leading-tight">
              {project.titulo}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="shrink-0 size-8 flex items-center justify-center rounded-full hover:bg-canvas transition-colors duration-[var(--duration-fast)]"
          >
            <X className="size-4 text-ink-muted" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-5">
          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-ink-muted">
            {project.compensacion != null && (
              <span className="flex items-center gap-1.5 font-semibold text-accent">
                <Wallet className="size-3.5" />
                {formatCompensacion(project.compensacion, project.moneda)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {project.plazo_dias} {t('days')}
            </span>
            {project.usa_ia && (
              <span className="flex items-center gap-1.5 text-accent font-semibold">
                <Zap className="size-3.5" />
                {t('uses_ia')}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-ink leading-relaxed line-clamp-4">
            {project.descripcion}
          </p>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="border border-primary text-primary text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                >
                  {skill.nombre}
                </span>
              ))}
            </div>
          )}

          {/* Company card */}
          {project.empresa && (
            <div className="rounded-xl border border-border bg-canvas p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                  <Building2 className="size-5 text-ink-muted" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-strong truncate">
                    {project.empresa.nombre_comercial}
                  </p>
                  <p className="text-xs text-ink-muted capitalize">
                    {project.empresa.tipo === 'empresa' ? t('company_type_empresa') : t('company_type_emprendedor')}
                  </p>
                </div>
              </div>
              {project.empresa.id && (
                <a
                  href={`/${locale}/empresa/${project.empresa.id}`}
                  className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  {t('view_company_profile')}
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-6 pb-6 pt-2 border-t border-border">
          <button
            type="button"
            onClick={handleGoToGestion}
            className="w-full rounded-full py-3 bg-secondary text-white font-semibold text-sm hover:bg-secondary/80 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]"
          >
            {t('go_to_gestion')}
          </button>
        </div>
      </div>
    </div>
  );
}
