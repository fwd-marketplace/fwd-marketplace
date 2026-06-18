'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Building2, Calendar, Clock, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { submitOfferAction } from '@/lib/actions/marketplace';
import type { ApiProject, ApiRoleName } from '@/lib/api/types';

const offerSchema = z.object({
  propuesta: z.string().min(50).max(5000),
  prototipo_url: z.union([z.string().url(), z.literal(''), z.undefined()]),
});

type OfferFormValues = z.infer<typeof offerSchema>;

interface Props {
  project: ApiProject;
  role: ApiRoleName | null;
}

export function ProjectDetail({ project, role }: Props) {
  const t = useTranslations('project_detail');
  const locale = useLocale();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OfferFormValues>({ resolver: zodResolver(offerSchema) });

  const onSubmit = async (data: OfferFormValues) => {
    setSubmitError('');
    const input = { propuesta: data.propuesta };
    const result = await submitOfferAction(
      project.id,
      data.prototipo_url ? { ...input, prototipo_url: data.prototipo_url } : input,
    );
    if (result.ok) {
      setSubmitted(true);
    } else {
      setSubmitError(result.error);
    }
  };

  const skills = project.skills.flatMap((s) => (s.skill ? [s.skill] : []));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href={`/${locale}/marketplace`}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Link>

      {/* hero */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-3">
          {project.area && (
            <Badge variant="secondary">{project.area.nombre}</Badge>
          )}
          {project.usa_ia && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
              <Zap className="h-3 w-3" />
              {t('uses_ia')}
            </span>
          )}
          <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-ink-muted capitalize">
            {project.estado.nombre.replace(/_/g, ' ')}
          </span>
        </div>

        <h1 className="font-archivo-narrow text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-strong mb-2">
          {project.titulo}
          <span className="text-primary">.</span>
        </h1>

        {project.empresa && (
          <p className="flex items-center gap-1.5 text-sm text-ink-muted mt-1">
            <Building2 className="h-4 w-4 shrink-0" />
            {project.empresa.nombre_comercial}
          </p>
        )}

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-ink-muted">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {t('duration', { days: project.plazo_dias })}
          </span>
          {project.fecha_publicacion && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {t('posted_on')}{' '}
              {new Date(project.fecha_publicacion).toLocaleDateString(locale, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      {/* description */}
      <section className="rounded-2xl border border-border bg-surface shadow-soft p-6 mb-6">
        <p className="text-ink leading-relaxed whitespace-pre-line">{project.descripcion}</p>
      </section>

      {/* skills */}
      {skills.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface shadow-soft p-6 mb-6">
          <h2 className="font-archivo-narrow font-bold text-lg text-ink-strong mb-4">
            {t('skills_required')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill.id} variant="secondary">
                {skill.nombre}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* offer form — student only */}
      {role === 'student' && !submitted && (
        <section className="rounded-2xl border border-border bg-surface shadow-soft p-6 mb-6">
          <h2 className="font-archivo-narrow font-bold text-xl text-ink-strong mb-1">
            {t('offer_title')}
          </h2>
          <p className="text-sm text-ink-muted mb-6">{t('offer_subtitle')}</p>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="propuesta"
                className="text-xs font-semibold text-ink-muted"
              >
                {t('offer_propuesta_label')}
              </label>
              <textarea
                id="propuesta"
                rows={6}
                placeholder={t('offer_propuesta_placeholder')}
                {...register('propuesta')}
                aria-invalid={!!errors.propuesta}
                className="w-full rounded-2xl bg-surface-sunken px-5 py-3.5 text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
              {errors.propuesta && (
                <p className="text-xs text-magenta">
                  {errors.propuesta.type === 'too_small'
                    ? t('offer_propuesta_min')
                    : t('offer_propuesta_required')}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="prototipo_url"
                className="text-xs font-semibold text-ink-muted"
              >
                {t('offer_prototipo_label')}
              </label>
              <input
                id="prototipo_url"
                type="url"
                placeholder={t('offer_prototipo_placeholder')}
                {...register('prototipo_url')}
                aria-invalid={!!errors.prototipo_url}
                className="w-full rounded-2xl bg-surface-sunken px-5 py-3.5 text-sm text-ink-strong placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary/40"
              />
              {errors.prototipo_url && (
                <p className="text-xs text-magenta">{t('offer_prototipo_invalid')}</p>
              )}
            </div>
            {submitError && (
              <p className="text-sm text-magenta">{t('offer_error_generic')}</p>
            )}
            <div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full"
              >
                {isSubmitting ? t('offer_submitting') : t('offer_submit')}
              </Button>
            </div>
          </form>
        </section>
      )}

      {role === 'student' && submitted && (
        <section className="rounded-2xl border border-accent/30 bg-accent/10 p-6 mb-6">
          <p className="font-semibold text-accent">{t('offer_success')}</p>
        </section>
      )}

      {/* owner banner — company */}
      {role === 'company' && (
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-archivo-narrow font-bold text-lg text-ink-strong">
              {t('owner_banner_title')}
            </p>
            <p className="text-sm text-ink-muted">{t('owner_banner_desc')}</p>
          </div>
          <Button asChild variant="outline" className="rounded-full shrink-0">
            <Link href={`/${locale}/postulaciones`}>
              <ExternalLink className="h-4 w-4 mr-1.5" />
              {t('owner_banner_cta')}
            </Link>
          </Button>
        </section>
      )}
    </div>
  );
}
