'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { Save, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Schema ──────────────────────────────────────────────────────────────────

function buildConfigSchema(t: ReturnType<typeof useTranslations<'admin'>>) {
  return z.object({
    platformName: z
      .string()
      .min(1, t('config.validation_name_required')),
    supportEmail: z
      .string()
      .email(t('config.validation_email_invalid')),
    slogan: z
      .string()
      .max(60, t('config.validation_slogan_max')),
    notifNewRequest: z.boolean(),
    notifCompanyApproved: z.boolean(),
    notifProjectModeration: z.boolean(),
    minMatchPct: z
      .number()
      .min(0, t('config.validation_min_match_range'))
      .max(100, t('config.validation_min_match_range')),
    maxModerationDays: z
      .number()
      .min(1, t('config.validation_max_days_min')),
  });
}

type ConfigFormValues = {
  platformName: string;
  supportEmail: string;
  slogan: string;
  notifNewRequest: boolean;
  notifCompanyApproved: boolean;
  notifProjectModeration: boolean;
  minMatchPct: number;
  maxModerationDays: number;
};

const DEFAULT_VALUES: ConfigFormValues = {
  platformName: 'FWD Marketplace',
  supportEmail: 'soporte@fwdcostarica.com',
  slogan: 'Talento que avanza.',
  notifNewRequest: true,
  notifCompanyApproved: true,
  notifProjectModeration: true,
  minMatchPct: 60,
  maxModerationDays: 7,
};

// ── Sub-components ───────────────────────────────────────────────────────────

interface FieldWrapperProps {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}

function FieldWrapper({ label, error, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-ink-strong">{label}</label>
      {children}
      {error !== undefined && error !== '' && (
        <p className="text-xs text-magenta font-medium">{error}</p>
      )}
    </div>
  );
}

interface ToggleRowProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

function ToggleRow({ id, label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
      <label htmlFor={id} className="text-sm text-ink cursor-pointer select-none">
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-[var(--duration-base)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          checked ? 'bg-primary' : 'bg-border-strong'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-[var(--duration-base)]',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function Configuracion() {
  const t = useTranslations('admin');
  const [saved, setSaved] = React.useState(false);

  const schema = React.useMemo(() => buildConfigSchema(t), [t]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ConfigFormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const notifNewRequest = watch('notifNewRequest');
  const notifCompanyApproved = watch('notifCompanyApproved');
  const notifProjectModeration = watch('notifProjectModeration');

  const onSubmit = (_data: ConfigFormValues) => {
    // Local state only — no persistence
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Sección: Plataforma */}
      <Card className="p-6 border-border bg-surface space-y-5">
        <h3 className="font-heading font-extrabold text-ink-strong text-sm uppercase tracking-widest border-b border-border pb-3">
          {t('config.section_platform')}
        </h3>

        <FieldWrapper
          label={t('config.platform_name_label')}
          error={errors.platformName?.message}
        >
          <input
            id="config-platform-name"
            type="text"
            placeholder={t('config.platform_name_placeholder')}
            {...register('platformName')}
            className={cn(
              'w-full px-3 py-2 bg-surface border rounded-xl text-sm focus:border-primary focus:outline-none transition-colors',
              errors.platformName ? 'border-magenta' : 'border-border'
            )}
          />
        </FieldWrapper>

        <FieldWrapper
          label={t('config.platform_email_label')}
          error={errors.supportEmail?.message}
        >
          <input
            id="config-support-email"
            type="email"
            placeholder={t('config.platform_email_placeholder')}
            {...register('supportEmail')}
            className={cn(
              'w-full px-3 py-2 bg-surface border rounded-xl text-sm focus:border-primary focus:outline-none transition-colors',
              errors.supportEmail ? 'border-magenta' : 'border-border'
            )}
          />
        </FieldWrapper>

        <FieldWrapper
          label={t('config.platform_slogan_label')}
          error={errors.slogan?.message}
        >
          <input
            id="config-slogan"
            type="text"
            placeholder={t('config.platform_slogan_placeholder')}
            {...register('slogan')}
            className={cn(
              'w-full px-3 py-2 bg-surface border rounded-xl text-sm focus:border-primary focus:outline-none transition-colors',
              errors.slogan ? 'border-magenta' : 'border-border'
            )}
          />
        </FieldWrapper>
      </Card>

      {/* Sección: Notificaciones */}
      <Card className="p-6 border-border bg-surface space-y-1">
        <h3 className="font-heading font-extrabold text-ink-strong text-sm uppercase tracking-widest border-b border-border pb-3 mb-3">
          {t('config.section_notifications')}
        </h3>

        <ToggleRow
          id="config-notif-new-request"
          label={t('config.notif_new_request')}
          checked={notifNewRequest}
          onChange={val => setValue('notifNewRequest', val, { shouldDirty: true })}
        />
        <ToggleRow
          id="config-notif-company-approved"
          label={t('config.notif_company_approved')}
          checked={notifCompanyApproved}
          onChange={val => setValue('notifCompanyApproved', val, { shouldDirty: true })}
        />
        <ToggleRow
          id="config-notif-project-moderation"
          label={t('config.notif_project_moderation')}
          checked={notifProjectModeration}
          onChange={val => setValue('notifProjectModeration', val, { shouldDirty: true })}
        />
      </Card>

      {/* Sección: Moderación */}
      <Card className="p-6 border-border bg-surface space-y-5">
        <h3 className="font-heading font-extrabold text-ink-strong text-sm uppercase tracking-widest border-b border-border pb-3">
          {t('config.section_moderation')}
        </h3>

        <FieldWrapper
          label={t('config.mod_min_match_label')}
          error={errors.minMatchPct?.message}
        >
          <div className="flex items-center gap-3">
            <input
              id="config-min-match"
              type="number"
              min={0}
              max={100}
              {...register('minMatchPct', { valueAsNumber: true })}
              className={cn(
                'w-28 px-3 py-2 bg-surface border rounded-xl text-sm focus:border-primary focus:outline-none transition-colors font-mono',
                errors.minMatchPct ? 'border-magenta' : 'border-border'
              )}
            />
            <span className="text-sm text-ink-muted">%</span>
          </div>
        </FieldWrapper>

        <FieldWrapper
          label={t('config.mod_max_days_label')}
          error={errors.maxModerationDays?.message}
        >
          <div className="flex items-center gap-3">
            <input
              id="config-max-days"
              type="number"
              min={1}
              {...register('maxModerationDays', { valueAsNumber: true })}
              className={cn(
                'w-28 px-3 py-2 bg-surface border rounded-xl text-sm focus:border-primary focus:outline-none transition-colors font-mono',
                errors.maxModerationDays ? 'border-magenta' : 'border-border'
              )}
            />
            <span className="text-sm text-ink-muted">días</span>
          </div>
        </FieldWrapper>
      </Card>

      {/* Save button */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-sm text-accent font-semibold flex items-center gap-1.5">
            <Check className="size-4" />
            {t('config.save_success')}
          </span>
        )}
        <Button
          type="submit"
          disabled={!isDirty && !saved}
          className={cn(
            'gap-2 rounded-full font-bold px-6',
            saved
              ? 'bg-accent hover:bg-accent/90 text-white'
              : 'bg-primary hover:bg-primary/90 text-white'
          )}
        >
          <Save className="size-4" />
          {t('config.save_btn')}
        </Button>
      </div>
    </form>
  );
}
