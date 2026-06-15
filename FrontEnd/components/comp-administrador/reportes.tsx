'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  FolderKanban,
  Users,
  TrendingUp,
  Star,
  Download,
  Check,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  event: string;
  actor: string;
  date: string;
  type: 'approved' | 'rejected' | 'created' | 'paused';
}

const RECENT_ACTIVITY: ActivityItem[] = [
  { id: 'a1', event: 'Empresa aprobada', actor: 'Pixel Studio', date: '2026-06-15', type: 'approved' },
  { id: 'a2', event: 'Proyecto en moderación', actor: 'Sistema de Facturación — Contaplus', date: '2026-06-14', type: 'created' },
  { id: 'a3', event: 'Solicitud rechazada', actor: 'Rodrigo Esquivel', date: '2026-06-13', type: 'rejected' },
  { id: 'a4', event: 'Proyecto pausado', actor: 'App Móvil Inventario — TechFlow', date: '2026-06-12', type: 'paused' },
  { id: 'a5', event: 'Egresado aprobado', actor: 'Kendall Rojas', date: '2026-06-11', type: 'approved' },
  { id: 'a6', event: 'Proyecto creado', actor: 'Portal E-commerce — Acme', date: '2026-06-10', type: 'created' },
];

interface BreakdownItem {
  label: string;
  value: number;
  total: number;
  colorClass: string;
}

function BreakdownBar({ label, value, total, colorClass }: BreakdownItem) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-ink">{label}</span>
        <span className="text-xs font-bold text-ink-muted">{value} ({pct}%)</span>
      </div>
      <div className="h-2 rounded-full bg-surface-sunken overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-[var(--duration-slow)]', colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function activityDotClass(type: ActivityItem['type']): string {
  switch (type) {
    case 'approved': return 'bg-accent';
    case 'rejected': return 'bg-magenta';
    case 'created': return 'bg-primary';
    case 'paused': return 'bg-warning';
  }
}

export function Reportes() {
  const t = useTranslations('admin');
  const [exported, setExported] = React.useState(false);

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  // Mock KPIs
  const kpis = [
    {
      id: 'new_projects',
      label: t('reports.kpi_new_projects'),
      value: '7',
      icon: FolderKanban,
      colorClass: 'bg-primary/10 text-primary',
    },
    {
      id: 'total_applications',
      label: t('reports.kpi_total_applications'),
      value: '38',
      icon: Users,
      colorClass: 'bg-secondary/10 text-secondary',
    },
    {
      id: 'acceptance_rate',
      label: t('reports.kpi_acceptance_rate'),
      value: '64%',
      icon: TrendingUp,
      colorClass: 'bg-accent/10 text-accent',
    },
    {
      id: 'active_talents',
      label: t('reports.kpi_active_talents'),
      value: '5',
      icon: Star,
      colorClass: 'bg-warning/10 text-warning',
    },
  ];

  // Breakdown data (mock)
  const projectsTotal = 12;
  const projectBreakdown: BreakdownItem[] = [
    { label: t('projects.status_active'), value: 6, total: projectsTotal, colorClass: 'bg-accent' },
    { label: t('projects.status_paused'), value: 3, total: projectsTotal, colorClass: 'bg-ink-muted' },
    { label: t('projects.status_moderation'), value: 2, total: projectsTotal, colorClass: 'bg-warning' },
    { label: t('projects.status_closed'), value: 1, total: projectsTotal, colorClass: 'bg-secondary' },
  ];

  const applicationsTotal = 38;
  const appBreakdown: BreakdownItem[] = [
    { label: t('applications.approved'), value: 12, total: applicationsTotal, colorClass: 'bg-accent' },
    { label: t('applications.pending'), value: 18, total: applicationsTotal, colorClass: 'bg-warning' },
    { label: t('applications.rejected'), value: 8, total: applicationsTotal, colorClass: 'bg-magenta' },
  ];

  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">{t('reports.subtitle')}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          className="border-border-strong text-ink hover:bg-canvas gap-1.5 h-8 text-xs font-bold rounded-full px-4"
        >
          {exported ? (
            <>
              <Check className="size-3 text-accent" />
              <span className="text-accent">{t('reports.export_success')}</span>
            </>
          ) : (
            <>
              <Download className="size-3" />
              {t('reports.export_btn')}
            </>
          )}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card
            key={kpi.id}
            className="p-5 border-border bg-surface flex items-center gap-4"
          >
            <div className={cn('p-3 rounded-xl shrink-0', kpi.colorClass)}>
              <kpi.icon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink-subtle uppercase tracking-wider leading-tight">
                {kpi.label}
              </p>
              <p className="text-2xl font-heading font-black text-ink-strong mt-0.5">
                {kpi.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breakdown panels */}
        <div className="space-y-6">
          {/* Proyectos por estado */}
          <Card className="p-5 border-border bg-surface space-y-4">
            <h3 className="font-heading font-extrabold text-ink-strong text-sm uppercase tracking-widest">
              {t('reports.breakdown_projects')}
            </h3>
            <div className="space-y-3">
              {projectBreakdown.map(item => (
                <BreakdownBar key={item.label} {...item} />
              ))}
            </div>
          </Card>

          {/* Postulaciones por estado */}
          <Card className="p-5 border-border bg-surface space-y-4">
            <h3 className="font-heading font-extrabold text-ink-strong text-sm uppercase tracking-widest">
              {t('reports.breakdown_applications')}
            </h3>
            <div className="space-y-3">
              {appBreakdown.map(item => (
                <BreakdownBar key={item.label} {...item} />
              ))}
            </div>
          </Card>
        </div>

        {/* Actividad reciente */}
        <Card className="border-border bg-surface overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-heading font-extrabold text-ink-strong text-sm uppercase tracking-widest">
              {t('reports.recent_activity')}
            </h3>
          </div>
          <div className="divide-y divide-border">
            {RECENT_ACTIVITY.length === 0 ? (
              <p className="p-6 text-sm text-ink-muted text-center">
                {t('reports.activity_empty')}
              </p>
            ) : (
              RECENT_ACTIVITY.map(item => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-surface-sunken/40 transition-colors duration-[var(--duration-fast)]"
                >
                  <span
                    className={cn(
                      'mt-1.5 size-2 rounded-full shrink-0',
                      activityDotClass(item.type)
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-strong leading-snug">
                      {item.event}
                    </p>
                    <p className="text-xs text-ink-muted truncate">{item.actor}</p>
                  </div>
                  <span className="text-[11px] text-ink-subtle font-medium shrink-0 pt-0.5">
                    {item.date}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
